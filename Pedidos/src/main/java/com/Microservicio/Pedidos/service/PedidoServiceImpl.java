package com.Microservicio.Pedidos.service;

import com.Microservicio.Pedidos.dto.ActualizarEstadoRequest;
import com.Microservicio.Pedidos.dto.CancelarPedidoRequest;
import com.Microservicio.Pedidos.dto.CrearPedidoRequest;
import com.Microservicio.Pedidos.dto.PedidoItemRequest;
import com.Microservicio.Pedidos.dto.PedidoResponse;
import com.Microservicio.Pedidos.exception.AccesoDenegadoException;
import com.Microservicio.Pedidos.exception.EstadoInvalidoException;
import com.Microservicio.Pedidos.exception.RecursoNoEncontradoException;
import com.Microservicio.Pedidos.exception.StockInsuficienteException;
import com.Microservicio.Pedidos.model.EstadoPedido;
import com.Microservicio.Pedidos.model.HistorialEstado;
import com.Microservicio.Pedidos.model.Pedido;
import com.Microservicio.Pedidos.model.PedidoItem;
import com.Microservicio.Pedidos.repository.PedidoRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PedidoServiceImpl implements PedidoService {

    private final PedidoRepository pedidoRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Override
    public PedidoResponse crearPedido(CrearPedidoRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("El pedido debe contener al menos un item");
        }

        for (PedidoItemRequest item : request.getItems()) {
            validarStock(item);
        }

        Pedido pedido = Pedido.builder()
                .usuarioId(request.getUsuarioId())
                .estado(EstadoPedido.PENDIENTE)
                .total(request.getTotal())
                .fechaCreacion(LocalDateTime.now())
                .items(request.getItems().stream().map(this::toItem).collect(Collectors.toList()))
                .build();

        pedido.getHistorialEstados().add(HistorialEstado.builder()
                .estado(EstadoPedido.PENDIENTE)
                .fecha(LocalDateTime.now())
                .usuario("system")
                .build());

        return toResponse(pedidoRepository.save(pedido));
    }

    @Override
    public List<PedidoResponse> listarPedidos(Long usuarioId, boolean esAdmin) {
        List<Pedido> pedidos = esAdmin ? pedidoRepository.findAll() : pedidoRepository.findByUsuarioId(usuarioId);
        return pedidos.stream().map(this::toResponse).toList();
    }

    @Override
    public PedidoResponse obtenerPedido(Long id, Long usuarioId, boolean esAdmin) {
        Pedido pedido = obtenerPorId(id);
        validarPropietario(pedido, usuarioId, esAdmin);
        return toResponse(pedido);
    }

    @Override
    public PedidoResponse cancelarPedido(Long id, Long usuarioId, boolean esAdmin, CancelarPedidoRequest request) {
        Pedido pedido = obtenerPorId(id);
        validarPropietario(pedido, usuarioId, esAdmin);

        if (!pedido.getEstado().puedeCancelar()) {
            throw new EstadoInvalidoException("El estado actual no permite cancelación");
        }

        pedido.setEstado(EstadoPedido.CANCELADO);
        pedido.getHistorialEstados().add(HistorialEstado.builder()
                .estado(EstadoPedido.CANCELADO)
                .fecha(LocalDateTime.now())
                .usuario(request != null ? request.getCanceladoPor() : "system")
                .build());

        Pedido actualizado = pedidoRepository.save(pedido);
        kafkaTemplate.send("pedidos-eventos", "Pedido " + actualizado.getId() + " cancelado");
        return toResponse(actualizado);
    }

    @Override
    public PedidoResponse actualizarEstado(Long id, ActualizarEstadoRequest request) {
        Pedido pedido = obtenerPorId(id);

        if (request == null || request.getNuevoEstado() == null) {
            throw new IllegalArgumentException("El nuevo estado es obligatorio");
        }

        if (!pedido.getEstado().siguientesValidos().contains(request.getNuevoEstado())) {
            throw new EstadoInvalidoException("Transición de estado no válida");
        }

        pedido.setEstado(request.getNuevoEstado());
        pedido.getHistorialEstados().add(HistorialEstado.builder()
                .estado(request.getNuevoEstado())
                .fecha(LocalDateTime.now())
                .usuario(request.getActualizadoPor())
                .build());

        return toResponse(pedidoRepository.save(pedido));
    }

    private Pedido obtenerPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado con ID: " + id));
    }

    private void validarPropietario(Pedido pedido, Long usuarioId, boolean esAdmin) {
        if (!esAdmin && !pedido.getUsuarioId().equals(usuarioId)) {
            throw new AccesoDenegadoException("No tienes acceso a este pedido");
        }
    }

    private void validarStock(PedidoItemRequest item) {
        if (item.getCantidad() == null || item.getStockDisponible() == null) {
            throw new IllegalArgumentException("Cantidad y stock son obligatorios");
        }

        if (item.getCantidad() > item.getStockDisponible()) {
            throw new StockInsuficienteException("Stock insuficiente para el SKU: " + item.getSku());
        }
    }

    private PedidoItem toItem(PedidoItemRequest request) {
        return PedidoItem.builder()
                .sku(request.getSku())
                .cantidad(request.getCantidad())
                .stockDisponible(request.getStockDisponible())
                .build();
    }

    private PedidoResponse toResponse(Pedido pedido) {
        return PedidoResponse.builder()
                .id(pedido.getId())
                .usuarioId(pedido.getUsuarioId())
                .estado(pedido.getEstado())
                .total(pedido.getTotal())
                .fechaCreacion(pedido.getFechaCreacion())
                .items(pedido.getItems())
                .historialEstados(pedido.getHistorialEstados())
                .build();
    }
}
