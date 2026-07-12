package com.smartlogix.pedidos.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.smartlogix.pedidos.event.PedidoCanceladoEvent;
import com.smartlogix.pedidos.event.PedidoCreadoEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PedidoKafkaProducer {

    private final KafkaTemplate<String, PedidoCreadoEvent> kafkaTemplatePedidoCreado;
    private final KafkaTemplate<String, PedidoCanceladoEvent> kafkaTemplatePedidoCancelado;

    public void publicarPedidoCreado(PedidoCreadoEvent event) {
        try {
            log.info("Intentando publicar evento PedidoCreado para pedidoId: {}", event.getPedidoId());
            kafkaTemplatePedidoCreado.send("pedido-creado", event.getPedidoId().toString(), event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("✅ Evento PedidoCreado publicado exitosamente para pedidoId: {} en topic: {}, partition: {}, offset: {}", 
                            event.getPedidoId(),
                            result.getRecordMetadata().topic(),
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset());
                    } else {
                        log.error("❌ Error al publicar evento PedidoCreado para pedidoId: {}: {}", 
                            event.getPedidoId(), ex.getMessage(), ex);
                    }
                });
        } catch (Exception e) {
            log.error("❌ Excepción al intentar publicar evento PedidoCreado: {}", e.getMessage(), e);
            throw e;
        }
    }

    public void publicarPedidoCancelado(PedidoCanceladoEvent event) {
        try {
            log.info("Intentando publicar evento PedidoCancelado para pedidoId: {}", event.getPedidoId());
            kafkaTemplatePedidoCancelado.send("pedido-cancelado", event.getPedidoId().toString(), event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("✅ Evento PedidoCancelado publicado exitosamente para pedidoId: {} en topic: {}, partition: {}, offset: {}", 
                            event.getPedidoId(),
                            result.getRecordMetadata().topic(),
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset());
                    } else {
                        log.error("❌ Error al publicar evento PedidoCancelado para pedidoId: {}: {}", 
                            event.getPedidoId(), ex.getMessage(), ex);
                    }
                });
        } catch (Exception e) {
            log.error("❌ Excepción al intentar publicar evento PedidoCancelado: {}", e.getMessage(), e);
            throw e;
        }
    }
}
