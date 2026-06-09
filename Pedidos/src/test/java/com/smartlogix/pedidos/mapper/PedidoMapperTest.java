package com.smartlogix.pedidos.mapper;

import com.smartlogix.pedidos.dto.*;
import com.smartlogix.pedidos.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class PedidoMapperTest {

    private PedidoMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new PedidoMapper();
    }

    @Test
    void toPedido_convierteCarritoAPedido() {
        Carrito carrito = Carrito.builder()
                .id(1L)
                .usuarioId(50L)
                .fechaCreacion(LocalDateTime.now())
                .build();

        CarritoItem item = CarritoItem.builder()
                .id(10L)
                .carrito(carrito)
                .sku("SKU-1")
                .nombreProducto("Prod")
                .cantidad(2)
                .precioUnitario(new BigDecimal("7.50"))
                .build();
        item.calcularSubtotal();
        carrito.agregarItem(item);

        Pedido pedido = mapper.toPedido(carrito);

        assertNotNull(pedido);
        assertEquals(1, pedido.getItems().size());
        assertEquals(new BigDecimal("15.00"), pedido.getTotal());
    }

    @Test
    void toItemPedido_fromCarritoItem_y_fromDto() {
        CarritoItem citem = CarritoItem.builder()
                .sku("SKU-2")
                .nombreProducto("Prod2")
                .cantidad(3)
                .precioUnitario(new BigDecimal("2.00"))
                .build();
        citem.calcularSubtotal();

        ItemPedido item = mapper.toItemPedido(citem);
        assertEquals("SKU-2", item.getSku());
        assertEquals(new BigDecimal("6.00"), item.getSubtotal());

        ItemPedidoDTO dto = ItemPedidoDTO.builder()
                .sku("SKU-3")
                .nombreProducto("Prod3")
                .cantidad(1)
                .precioUnitario(new BigDecimal("9.99"))
                .build();

        ItemPedido itemFromDto = mapper.toItemPedido(dto);
        assertEquals("SKU-3", itemFromDto.getSku());
        assertEquals(new BigDecimal("9.99"), itemFromDto.getSubtotal());
    }

    @Test
    void toPedidoResponseDTO_y_lista_y_carritoItemMappings() {
        Pedido pedido = Pedido.builder()
                .id(2L)
                .usuarioId(77L)
                .carritoId(3L)
                .estado(com.smartlogix.pedidos.model.EstadoPedido.PENDIENTE)
                .fechaCreacion(LocalDateTime.now())
                .build();

        ItemPedido item = ItemPedido.builder()
                .sku("SKU-9")
                .nombreProducto("P9")
                .cantidad(1)
                .precioUnitario(new BigDecimal("1.00"))
                .build();
        item.calcularSubtotal();
        pedido.setItems(Collections.singletonList(item));
        pedido.calcularTotal();

        PedidoResponseDTO resp = mapper.toPedidoResponseDTO(pedido);
        assertEquals(2L, resp.getId());
        assertEquals("PENDIENTE", resp.getEstado());
        assertEquals(1, resp.getItems().size());

        PedidoListaResponseDTO listaDto = mapper.toPedidoListaResponseDTO(pedido);
        assertEquals(1, listaDto.getCantidadItems());

        Carrito carrito = Carrito.builder().id(5L).usuarioId(99L).build();
        CarritoItem carItem = CarritoItem.builder().id(12L).sku("X").nombreProducto("N").cantidad(1).precioUnitario(new BigDecimal("3.00")).build();
        carItem.calcularSubtotal();
        carrito.agregarItem(carItem);

        CarritoResponseDTO cr = mapper.toCarritoResponseDTO(carrito);
        assertEquals(1, cr.getItems().size());
        assertEquals(new BigDecimal("3.00"), cr.getTotal());
    }
}
