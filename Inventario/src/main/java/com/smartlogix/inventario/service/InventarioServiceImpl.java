package com.smartlogix.inventario.service;

import com.smartlogix.inventario.dto.*;
import com.smartlogix.inventario.entity.*;
import com.smartlogix.inventario.exception.*;
import com.smartlogix.inventario.kafka.InventarioKafkaProducer;
import com.smartlogix.inventario.repository.*;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                .stockDisponible(request.getStockInicial())
                .stockReservado(0)
                .umbralMinimo(request.getUmbralMinimo())
                .build();

        Inventario guardado = inventarioRepository.save(inventario);
        registrarMovimiento(guardado, TipoMovimiento.INICIAL, request.getStockInicial(), "Registro inicial de stock");
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
        
        inv.setStockDisponible(inv.getStockDisponible() + request.getCantidad());
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

        inv.setStockDisponible(inv.getStockDisponible() - cantidad);
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
        inv.setStockReservado(Math.max(0, inv.getStockReservado() - cantidad));
        inv.setStockDisponible(inv.getStockDisponible() + cantidad);
        inventarioRepository.save(inv);

        registrarMovimiento(inv, TipoMovimiento.LIBERACION, cantidad, "Liberación Pedido: " + pedidoId);
        kafkaProducer.enviarEventoActualizacion(inv);
    }

    @Override
    @Transactional
    public void actualizarStock(String sku, int nuevaCantidad, String motivo) {
        Inventario inv = obtenerPorSku(sku);
        int diferencia = nuevaCantidad - inv.getStockDisponible();
        inv.setStockDisponible(nuevaCantidad);
        inventarioRepository.save(inv);
        
        registrarMovimiento(inv, TipoMovimiento.AJUSTE, diferencia, motivo);
        verificarYNotificarStockBajo(inv);
        kafkaProducer.enviarEventoActualizacion(inv);
    }

    @Override
    public List<MovimientoInventario> obtenerMovimientos(Long inventarioId) {
        return movimientoRepository.findByInventario_IdOrderByFechaCreacionDesc(inventarioId);
    }

    private void registrarMovimiento(Inventario inv, TipoMovimiento tipo, int qty, String motivo) {
        MovimientoInventario movimiento = MovimientoInventario.builder()
                .inventario(inv)
                .tipoMovimiento(tipo)
                .cantidad(qty)
                .motivo(motivo)
                .build();
        movimientoRepository.save(movimiento);
    }

    private void verificarYNotificarStockBajo(Inventario inv) {
        if (inv.getStockDisponible() < inv.getUmbralMinimo()) {
            kafkaProducer.enviarAlertaStockBajo(inv);
        }
    }
}