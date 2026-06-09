package com.smartlogix.pedidos.kafka;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PedidoKafkaConsumerTest {

    @Test
    void listeners_noLanzanExcepcion() {
        PedidoKafkaConsumer consumer = new PedidoKafkaConsumer();
        assertDoesNotThrow(() -> consumer.listenStockReservado("{\"id\":1}"));
        assertDoesNotThrow(() -> consumer.listenStockLiberado("{\"id\":1}"));
    }
}
