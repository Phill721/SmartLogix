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

    @KafkaListener(topics = "pedido-creado", groupId = "grupo-inventario")
    public void listenPedidoCreado(String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);
            String pedidoId = node.has("pedidoId") ? node.get("pedidoId").asText() : "pedido-creado";

            JsonNode items = node.get("items");
            if (items != null && items.isArray()) {
                for (JsonNode item : items) {
                    String sku = item.get("sku").asText();
                    int cantidad = item.get("cantidad").asInt();
                    service.reservarStock(sku, cantidad, pedidoId);
                    log.info("Kafka: Reserva procesada para pedido={} SKU={} cantidad={}", pedidoId, sku, cantidad);
                }
            } else if (node.has("sku")) {
                String sku = node.get("sku").asText();
                int cantidad = node.get("cantidad").asInt();
                service.reservarStock(sku, cantidad, pedidoId);
                log.info("Kafka: Reserva procesada para pedido={} SKU={} cantidad={}", pedidoId, sku, cantidad);
            }
        } catch (Exception e) {
            log.error("Error procesando pedido-creado: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "pedido-confirmado", groupId = "grupo-inventario")
    public void listenPedidoConfirmado(String payload) {
        listenPedidoCreado(payload);
    }

    @KafkaListener(topics = "pedido-cancelado", groupId = "grupo-inventario")
    public void listenPedidoCancelado(String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);
            String sku = node.has("sku") ? node.get("sku").asText() : null;
            int cantidad = node.has("cantidad") ? node.get("cantidad").asInt() : 0;
            String pedidoId = node.has("pedidoId") ? node.get("pedidoId").asText() : "pedido-cancelado";

            if (sku != null && cantidad > 0) {
                service.liberarStock(sku, cantidad, pedidoId);
                log.info("Kafka: Cancelación de pedido procesada para SKU={} cantidad={}", sku, cantidad);
            } else {
                JsonNode items = node.get("items");
                if (items != null && items.isArray()) {
                    for (JsonNode item : items) {
                        String itemSku = item.get("sku").asText();
                        int itemCantidad = item.get("cantidad").asInt();
                        service.liberarStock(itemSku, itemCantidad, pedidoId);
                        log.info("Kafka: Cancelación de pedido procesada para SKU={} cantidad={}", itemSku, itemCantidad);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error procesando pedido-cancelado: {}", e.getMessage(), e);
        }
    }
}