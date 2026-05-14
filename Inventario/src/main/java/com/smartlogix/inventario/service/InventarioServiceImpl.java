package com.smartlogix.inventario.service;

import com.smartlogix.inventario.dto.AjusteRequest;
import com.smartlogix.inventario.dto.InventarioRequest;
import com.smartlogix.inventario.dto.MovimientoDTO;
import com.smartlogix.inventario.entity.Inventario;
import com.smartlogix.inventario.entity.MovimientoInventario;
import com.smartlogix.inventario.entity.TipoMovimiento;
import com.smartlogix.inventario.exception.ProductoNoEncontradoException;
import com.smartlogix.inventario.exception.StockInsuficienteException;
import com.smartlogix.inventario.kafka.InventarioKafkaProducer;
import com.smartlogix.inventario.repository.InventarioRepository;
import com.smartlogix.inventario.repository.MovimientoInventarioRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventarioServiceImpl implements InventarioService {

    private final InventarioRepository inventarioRepository;
    private final MovimientoInventarioRepository movimientoRepository;
    private final InventarioKafkaProducer kafkaProducer;

    @Override
    @Transactional
    public Inventario crearInventario(InventarioRequest request) {
        Inventario inventario = Inventario.builder()
                .productoId(request.getProductoId())
                .sku(request.getSku())
                .bodegaId(request.getBodegaId())
                .stockTotal(request.getStockTotal())
                .stockReservado(0)
                .umbralMinimo(request.getUmbralMinimo())
                .build();

        Inventario guardado = inventarioRepository.save(inventario);
        registrarMovimiento(guardado, TipoMovimiento.INICIAL, request.getStockTotal(), "Registro inicial de stock");
        return guardado;
    }

    @Override
    @CircuitBreaker(name = "inventario")
    public Inventario obtenerPorSku(String sku) {
        return inventarioRepository.findBySku(sku)
                .orElseThrow(() -> new ProductoNoEncontradoException("Producto no encontrado con SKU: " + sku));
    }

    @Override
    public List<Inventario> obtenerPorBodega(Long bodegaId) {
        return inventarioRepository.findByBodegaId(bodegaId);
    }

    @Override
    @Transactional
    public Inventario ajusteManual(Long id, AjusteRequest request) {
        Inventario inv = inventarioRepository.findById(id)
                .orElseThrow(() -> new ProductoNoEncontradoException("ID de inventario no existe"));

        int nuevoStockTotal = inv.getStockTotal() + request.getCantidad();
        if (nuevoStockTotal < inv.getStockReservado()) {
            throw new IllegalArgumentException(
                    "Ajuste inválido: el stock total no puede ser menor al stock reservado.");
        }

        inv.setStockTotal(nuevoStockTotal);
        Inventario guardado = inventarioRepository.save(inv);

        registrarMovimiento(guardado, TipoMovimiento.AJUSTE, request.getCantidad(), request.getMotivo());
        verificarYNotificarStockBajo(guardado);
        kafkaProducer.enviarEventoActualizacion(guardado);

        return guardado;
    }

    @Override
    @Transactional
    public void reservarStock(String sku, int cantidad, String pedidoId) {
        Inventario inv = obtenerPorSku(sku);
        if (inv.getStockDisponible() < cantidad) {
            throw new StockInsuficienteException("Stock insuficiente para realizar la reserva");
        }

        inv.setStockReservado(inv.getStockReservado() + cantidad);
        inventarioRepository.save(inv);

        registrarMovimiento(inv, TipoMovimiento.RESERVA, cantidad, "Reserva Pedido: " + pedidoId);
        verificarYNotificarStockBajo(inv);
        kafkaProducer.enviarEventoActualizacion(inv);
    }

    @Override
    @Transactional
    public void liberarStock(String sku, int cantidad, String pedidoId) {
        Inventario inv = obtenerPorSku(sku);
        if (cantidad > inv.getStockReservado()) {
            throw new IllegalArgumentException("No se puede liberar más stock del que está reservado.");
        }

        inv.setStockReservado(inv.getStockReservado() - cantidad);
        inventarioRepository.save(inv);

        registrarMovimiento(inv, TipoMovimiento.LIBERACION, cantidad, "Liberación Pedido: " + pedidoId);
        kafkaProducer.enviarEventoActualizacion(inv);
    }

    @Override
    @Transactional
    public void confirmarVenta(String sku, int cantidad, String pedidoId) {
        Inventario inv = obtenerPorSku(sku);
        if (cantidad > inv.getStockReservado()) {
            throw new IllegalArgumentException("No se puede confirmar una venta con más stock del reservado.");
        }

        inv.setStockReservado(inv.getStockReservado() - cantidad);
        inv.setStockTotal(inv.getStockTotal() - cantidad);
        inventarioRepository.save(inv);

        registrarMovimiento(inv, TipoMovimiento.VENTA, cantidad, "Confirmación de venta Pedido: " + pedidoId);
        verificarYNotificarStockBajo(inv);
        kafkaProducer.enviarEventoActualizacion(inv);
    }

    @Override
    @Transactional
    public void actualizarStock(String sku, int nuevaCantidad, String motivo) {
        Inventario inv = obtenerPorSku(sku);
        if (nuevaCantidad < inv.getStockReservado()) {
            throw new IllegalArgumentException("El stock total no puede ser menor al stock reservado.");
        }

        int diferencia = nuevaCantidad - inv.getStockTotal();
        inv.setStockTotal(nuevaCantidad);
        inventarioRepository.save(inv);

        registrarMovimiento(inv, TipoMovimiento.AJUSTE, diferencia, motivo);
        verificarYNotificarStockBajo(inv);
        kafkaProducer.enviarEventoActualizacion(inv);
    }

    @Override
    public List<MovimientoDTO> obtenerMovimientos(Long inventarioId) {
        List<MovimientoInventario> movimientos = movimientoRepository.findByInventario_IdOrderByFechaDesc(inventarioId);

        return movimientos.stream()
                .map(mov -> MovimientoDTO.builder()
                        .id(mov.getId())
                        .cantidad(mov.getCantidad())
                        .tipoMovimiento(mov.getTipoMovimiento().name())
                        .motivo(mov.getMotivo())
                        .fecha(mov.getFecha())
                        .usuarioResponsable(mov.getUsuarioResponsable())
                        .build())
                .toList();
    }

    private void registrarMovimiento(Inventario inv, TipoMovimiento tipo, int qty, String motivo) {
        MovimientoInventario movimiento = MovimientoInventario.builder()
                .inventario(inv)
                .tipoMovimiento(tipo)
                .cantidad(qty)
                .motivo(motivo)
                .fecha(LocalDateTime.now())
                .build();
        movimientoRepository.save(movimiento);
    }

    private void verificarYNotificarStockBajo(Inventario inv) {
        if (inv.getStockDisponible() < inv.getUmbralMinimo()) {
            kafkaProducer.enviarAlertaStockBajo(inv);
        }
    }
}