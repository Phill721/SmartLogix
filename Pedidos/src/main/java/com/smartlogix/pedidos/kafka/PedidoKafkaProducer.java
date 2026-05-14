package com.smartlogix.pedidos.kafka;

import com.smartlogix.pedidos.event.PedidoCreadoEvent;
import com.smartlogix.pedidos.event.PedidoCanceladoEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PedidoKafkaProducer {

    private final KafkaTemplate<String, PedidoCreadoEvent> kafkaTemplatePedidoCreado;
    private final KafkaTemplate<String, PedidoCanceladoEvent> kafkaTemplatePedidoCancelado;

    public void publicarPedidoCreado(PedidoCreadoEvent event) {
        try {
            kafkaTemplatePedidoCreado.send("pedido-creado", event.getPedidoId().toString(), event);
            log.info("Evento PedidoCreado publicado para pedidoId: {}", event.getPedidoId());
        } catch (Exception e) {
            log.error("Error al publicar evento PedidoCreado: {}", e.getMessage(), e);
            throw e;
        }
    }

    public void publicarPedidoCancelado(PedidoCanceladoEvent event) {
        try {
            kafkaTemplatePedidoCancelado.send("pedido-cancelado", event.getPedidoId().toString(), event);
            log.info("Evento PedidoCancelado publicado para pedidoId: {}", event.getPedidoId());
        } catch (Exception e) {
            log.error("Error al publicar evento PedidoCancelado: {}", e.getMessage(), e);
            throw e;
        }
    }
}
