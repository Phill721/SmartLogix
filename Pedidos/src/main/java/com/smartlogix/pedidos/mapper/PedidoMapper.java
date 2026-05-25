package com.smartlogix.pedidos.mapper;

import com.smartlogix.pedidos.dto.*;
import com.smartlogix.pedidos.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class PedidoMapper {

        public Pedido toPedido(Carrito carrito) {
                Pedido pedido = Pedido.builder()
                                .carritoId(carrito.getId())
                                .build();

                pedido.setItems(carrito.getItems().stream()
                .map(this::toItemPedido)
                .peek(item -> item.setPedido(pedido))
                .collect(Collectors.toList()));

        pedido.calcularTotal();
        return pedido;
    }

    public ItemPedido toItemPedido(ItemPedidoDTO dto) {
        ItemPedido item = ItemPedido.builder()
                .sku(dto.getSku())
                .nombreProducto(dto.getNombreProducto())
                .cantidad(dto.getCantidad())
                .precioUnitario(dto.getPrecioUnitario())
                .build();
        item.calcularSubtotal();
        return item;
    }

    public PedidoResponseDTO toPedidoResponseDTO(Pedido pedido) {
        return PedidoResponseDTO.builder()
                .id(pedido.getId())
                .usuarioId(pedido.getUsuarioId())
                .carritoId(pedido.getCarritoId())
                .estado(pedido.getEstado().toString())
                .items(pedido.getItems().stream()
                        .map(this::toItemPedidoDTO)
                        .collect(Collectors.toList()))
                .historial(pedido.getHistorial().stream()
                        .map(this::toHistorialEstadoDTO)
                        .collect(Collectors.toList()))
                .total(pedido.getTotal())
                .fechaCreacion(pedido.getFechaCreacion())
                .fechaActualizacion(pedido.getFechaActualizacion())
                .motivoRechazo(pedido.getMotivoRechazo())
                .build();
    }

    public ItemPedidoDTO toItemPedidoDTO(ItemPedido item) {
        return ItemPedidoDTO.builder()
                .sku(item.getSku())
                .nombreProducto(item.getNombreProducto())
                .cantidad(item.getCantidad())
                .precioUnitario(item.getPrecioUnitario())
                .subtotal(item.getSubtotal())
                .build();
    }

    public HistorialEstadoDTO toHistorialEstadoDTO(HistorialEstadoPedido historial) {
        return HistorialEstadoDTO.builder()
                .id(historial.getId())
                .estadoAnterior(historial.getEstadoAnterior() != null ? historial.getEstadoAnterior().toString() : null)
                .estadoNuevo(historial.getEstadoNuevo().toString())
                .timestamp(historial.getTimestamp())
                .motivo(historial.getMotivo())
                .build();
    }

    public PedidoListaResponseDTO toPedidoListaResponseDTO(Pedido pedido) {
        return PedidoListaResponseDTO.builder()
                .id(pedido.getId())
                .estado(pedido.getEstado().toString())
                .total(pedido.getTotal())
                .fechaCreacion(pedido.getFechaCreacion())
                .cantidadItems(pedido.getItems().size())
                .build();
    }

    public Page<PedidoListaResponseDTO> toPedidoListaResponseDTOPage(Page<Pedido> pedidos) {
        return pedidos.map(this::toPedidoListaResponseDTO);
    }

    public CarritoResponseDTO toCarritoResponseDTO(Carrito carrito) {
        return CarritoResponseDTO.builder()
                .id(carrito.getId())
                .usuarioId(carrito.getUsuarioId())
                .items(carrito.getItems().stream()
                        .map(this::toCarritoItemResponseDTO)
                        .collect(Collectors.toList()))
                .total(carrito.getTotal())
                .fechaCreacion(carrito.getFechaCreacion())
                .fechaActualizacion(carrito.getFechaActualizacion())
                .build();
    }

    public CarritoItemResponseDTO toCarritoItemResponseDTO(CarritoItem item) {
        return CarritoItemResponseDTO.builder()
                .id(item.getId())
                .sku(item.getSku())
                .nombreProducto(item.getNombreProducto())
                .cantidad(item.getCantidad())
                .precioUnitario(item.getPrecioUnitario())
                .subtotal(item.getSubtotal())
                .build();
    }

    public CarritoItem toCarritoItem(AgregarAlCarritoRequestDTO dto) {
        CarritoItem item = CarritoItem.builder()
                .sku(dto.getSku())
                .nombreProducto(dto.getNombreProducto())
                .cantidad(dto.getCantidad())
                .precioUnitario(dto.getPrecioUnitario())
                .build();
        item.calcularSubtotal();
        return item;
    }
}
