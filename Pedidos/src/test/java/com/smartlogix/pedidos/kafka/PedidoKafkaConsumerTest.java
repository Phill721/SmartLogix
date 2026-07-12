package com.smartlogix.pedidos.kafka;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.mock;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.pedidos.repository.PedidoRepository;

class PedidoKafkaConsumerTest {

    @Test
    void listeners_noLanzanExcepcion() {
        PedidoRepository pedidoRepository = mock(PedidoRepository.class);
        PedidoKafkaConsumer consumer = new PedidoKafkaConsumer(pedidoRepository, new ObjectMapper());

        assertDoesNotThrow(() -> consumer.listenStockReservado("{\"id\":1}"));
        assertDoesNotThrow(() -> consumer.listenStockLiberado("{\"id\":1}"));
    }
}
