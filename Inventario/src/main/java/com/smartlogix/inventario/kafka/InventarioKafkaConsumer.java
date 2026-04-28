package com.smartlogix.inventario.kafka;

import com.smartlogix.inventario.service.InventarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventarioKafkaConsumer {

    private final InventarioService inventarioService;

    @KafkaListener(topics = "pedido-creado", groupId = "grupo-inventario")
    public void manejarPedidoCreado(Map<String, Object> payload) {
        try {
            String sku = (String) payload.get("sku");
            Integer cantidad = (Integer) payload.get("cantidad");
            String pedidoId = (String) payload.get("pedidoId");
            inventarioService.reservarStock(sku, cantidad, pedidoId);
            log.info("Stock reservado vía Kafka para pedido: {}", pedidoId);
        } catch (Exception e) {
            log.error("Error procesando pedido-creado: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "pedido-cancelado", groupId = "grupo-inventario")
    public void manejarPedidoCancelado(Map<String, Object> payload) {
        try {
            String sku = (String) payload.get("sku");
            Integer cantidad = (Integer) payload.get("cantidad");
            String pedidoId = (String) payload.get("pedidoId");
            inventarioService.liberarStock(sku, cantidad, pedidoId);
            log.info("Stock liberado vía Kafka para pedido cancelado: {}", pedidoId);
        } catch (Exception e) {
            log.error("Error procesando pedido-cancelado: {}", e.getMessage());
        }
    }
}