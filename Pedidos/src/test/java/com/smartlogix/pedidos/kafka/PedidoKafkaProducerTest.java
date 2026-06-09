package com.smartlogix.pedidos.kafka;

import com.smartlogix.pedidos.event.PedidoCanceladoEvent;
import com.smartlogix.pedidos.event.PedidoCreadoEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.kafka.core.KafkaTemplate;

import static org.mockito.Mockito.*;

class PedidoKafkaProducerTest {

    @Mock
    private KafkaTemplate<String, PedidoCreadoEvent> kafkaTemplateCreado;

    @Mock
    private KafkaTemplate<String, PedidoCanceladoEvent> kafkaTemplateCancelado;

    private PedidoKafkaProducer producer;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        producer = new PedidoKafkaProducer(kafkaTemplateCreado, kafkaTemplateCancelado);
    }

    @Test
    void publicarPedidoCreado_delegaAKafkaTemplate() {
        PedidoCreadoEvent event = PedidoCreadoEvent.builder().pedidoId(1L).build();
        doReturn(null).when(kafkaTemplateCreado).send(anyString(), anyString(), any(PedidoCreadoEvent.class));

        producer.publicarPedidoCreado(event);

        verify(kafkaTemplateCreado, times(1)).send("pedido-creado", "1", event);
    }

    @Test
    void publicarPedidoCancelado_delegaAKafkaTemplate() {
        PedidoCanceladoEvent event = PedidoCanceladoEvent.builder().pedidoId(2L).build();
        doReturn(null).when(kafkaTemplateCancelado).send(anyString(), anyString(), any(PedidoCanceladoEvent.class));

        producer.publicarPedidoCancelado(event);

        verify(kafkaTemplateCancelado, times(1)).send("pedido-cancelado", "2", event);
    }
}
