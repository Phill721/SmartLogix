package com.smartlogix.pedidos.mapper;

import java.util.ArrayList;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import com.smartlogix.pedidos.dto.AgregarAlCarritoRequestDTO;
import com.smartlogix.pedidos.dto.CarritoItemResponseDTO;
import com.smartlogix.pedidos.dto.CarritoResponseDTO;
import com.smartlogix.pedidos.dto.HistorialEstadoDTO;
import com.smartlogix.pedidos.dto.ItemPedidoDTO;
import com.smartlogix.pedidos.dto.PedidoListaResponseDTO;
import com.smartlogix.pedidos.dto.PedidoResponseDTO;
import com.smartlogix.pedidos.entity.Carrito;
import com.smartlogix.pedidos.entity.CarritoItem;
import com.smartlogix.pedidos.entity.HistorialEstadoPedido;
import com.smartlogix.pedidos.entity.ItemPedido;
import com.smartlogix.pedidos.entity.Pedido;

@Component
public class PedidoMapper {

    public Pedido toPedido(Carrito carrito) {
        Pedido pedido = Pedido.builder()
                .carritoId(carrito.getId())
                .build();

        // Crear una nueva lista de items en vez de reutilizar la del carrito
        pedido.setItems(carrito.getItems().stream()
                .map(this::toItemPedido)
                .peek(item -> item.setPedido(pedido))
                .collect(Collectors.toCollection(ArrayList::new)));

        pedido.calcularTotal();
        return pedido;
    }

    public ItemPedido toItemPedido(CarritoItem item) {
        ItemPedido pedidoItem = ItemPedido.builder()
                .sku(item.getSku())
                .nombreProducto(item.getNombreProducto())
                .cantidad(item.getCantidad())
                .precioUnitario(item.getPrecioUnitario())
                .build();
        pedidoItem.calcularSubtotal();
        return pedidoItem;
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
