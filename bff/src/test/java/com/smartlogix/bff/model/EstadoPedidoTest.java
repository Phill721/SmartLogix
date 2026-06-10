package com.Microservicio.Pedidos.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;
import org.junit.jupiter.api.Test;

class EstadoPedidoTest {

    @Test
    void puedeCancelar_soloPendienteYConfirmado() {
        assertTrue(EstadoPedido.PENDIENTE.puedeCancelar());
        assertTrue(EstadoPedido.CONFIRMADO.puedeCancelar());
        assertFalse(EstadoPedido.ENVIADO.puedeCancelar());
        assertFalse(EstadoPedido.ENTREGADO.puedeCancelar());
        assertFalse(EstadoPedido.CANCELADO.puedeCancelar());
    }

    @Test
    void siguientesValidos_paraCadaEstado() {
        assertEquals(Set.of(EstadoPedido.CONFIRMADO, EstadoPedido.CANCELADO), EstadoPedido.PENDIENTE.siguientesValidos());
        assertEquals(Set.of(EstadoPedido.ENVIADO, EstadoPedido.CANCELADO), EstadoPedido.CONFIRMADO.siguientesValidos());
        assertEquals(Set.of(EstadoPedido.ENTREGADO), EstadoPedido.ENVIADO.siguientesValidos());
        assertEquals(Set.of(), EstadoPedido.ENTREGADO.siguientesValidos());
        assertEquals(Set.of(), EstadoPedido.CANCELADO.siguientesValidos());
    }
}
