package com.smartlogix.pedidos.entity;

import com.smartlogix.pedidos.model.EstadoPedido;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class EntitiesTest {

    @Test
    void carrito_agregar_remover_vaciar_y_calcularTotal() {
        Carrito carrito = Carrito.builder()
                .id(1L)
                .usuarioId(10L)
                .fechaCreacion(LocalDateTime.now())
                .build();

        CarritoItem item = CarritoItem.builder()
                .id(2L)
                .carrito(carrito)
                .sku("S1")
                .nombreProducto("N1")
                .cantidad(2)
                .precioUnitario(new BigDecimal("4.00"))
                .build();
        item.calcularSubtotal();
        carrito.agregarItem(item);

        assertEquals(new BigDecimal("8.00"), carrito.getTotal());

        carrito.removerItem(2L);
        assertEquals(new BigDecimal("0"), carrito.getTotal());

        carrito.agregarItem(item);
        carrito.vaciar();
        assertTrue(carrito.getItems().isEmpty());
        assertEquals(new BigDecimal("0"), carrito.getTotal());
    }

    @Test
    void carritoItem_calcularSubtotal_conValoresNulos_noExplota() {
        CarritoItem item = new CarritoItem();
        // dejar precioUnitario y cantidad null debe no causar NPE
        item.calcularSubtotal();
        assertNull(item.getSubtotal());

        item.setPrecioUnitario(new BigDecimal("2.00"));
        item.setCantidad(3);
        item.calcularSubtotal();
        assertEquals(new BigDecimal("6.00"), item.getSubtotal());
    }

    @Test
    void pedido_calcularTotal_y_registrarCambioEstado() {
        Pedido pedido = new Pedido();
        pedido.setId(1L);
        pedido.setUsuarioId(5L);
        pedido.setFechaCreacion(LocalDateTime.now());

        ItemPedido ip = ItemPedido.builder()
                .sku("I1")
                .cantidad(2)
                .precioUnitario(new BigDecimal("5.00"))
                .build();
        ip.calcularSubtotal();

        pedido.getItems().add(ip);
        pedido.calcularTotal();

        assertEquals(new BigDecimal("10.00"), pedido.getTotal());

        pedido.setEstado(EstadoPedido.PENDIENTE);
        pedido.registrarCambioEstado(EstadoPedido.CONFIRMADO, "Motivo test");
        assertEquals(EstadoPedido.CONFIRMADO, pedido.getEstado());
        assertFalse(pedido.getHistorial().isEmpty());
        assertEquals("Motivo test", pedido.getHistorial().get(0).getMotivo());
    }
}
