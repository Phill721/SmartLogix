package com.smartlogix.pedidos.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TipoEventoPedidoTest {

    @Test
    void enum_hasValues() {
        TipoEventoPedido[] vals = TipoEventoPedido.values();
        assertTrue(vals.length > 0);
        assertEquals("PEDIDO_CREADO", TipoEventoPedido.PEDIDO_CREADO.name());
    }
}
