package com.smartlogix.inventario.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.inventario.service.InventarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class InventarioConsumer {

    private final InventarioService service;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "pedido-confirmado", groupId = "grupo-inventario")
    public void listenPedidoConfirmado(String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);
            String sku = node.get("sku").asText();
            int cantidad = node.get("cantidad").asInt();
            String pedidoId = node.has("pedidoId") ? node.get("pedidoId").asText() : "pedido-confirmado";

            service.confirmarVenta(sku, cantidad, pedidoId);
            log.info("Kafka: Confirmación de pedido procesada para SKU={} cantidad={}", sku, cantidad);
        } catch (Exception e) {
            log.error("Error procesando pedido-confirmado: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "pedido-cancelado", groupId = "grupo-inventario")
    public void listenPedidoCancelado(String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);
            String sku = node.get("sku").asText();
            int cantidad = node.get("cantidad").asInt();
            String pedidoId = node.has("pedidoId") ? node.get("pedidoId").asText() : "pedido-cancelado";

            service.liberarStock(sku, cantidad, pedidoId);
            log.info("Kafka: Cancelación de pedido procesada para SKU={} cantidad={}", sku, cantidad);
        } catch (Exception e) {
            log.error("Error procesando pedido-cancelado: {}", e.getMessage(), e);
        }
    }
}