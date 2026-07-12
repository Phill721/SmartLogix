package com.smartlogix.pedidos.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.pedidos.entity.Pedido;
import com.smartlogix.pedidos.model.EstadoPedido;
import com.smartlogix.pedidos.repository.PedidoRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PedidoKafkaConsumer {

    private final PedidoRepository pedidoRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "stock-reservado", groupId = "grupo-pedidos")
    public void listenStockReservado(String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);
            String pedidoId = node.has("pedidoId") ? node.get("pedidoId").asText() : null;

            if (pedidoId == null) {
                log.warn("No se recibió pedidoId en stock-reservado: {}", payload);
                return;
            }

            Pedido pedido = pedidoRepository.findById(Long.valueOf(pedidoId)).orElse(null);
            if (pedido == null) {
                log.warn("No se encontró el pedido {} para procesar stock-reservado", pedidoId);
                return;
            }

            if (pedido.getEstado() == EstadoPedido.PENDIENTE) {
                pedido.registrarCambioEstado(EstadoPedido.CONFIRMADO, "Stock reservado en inventario");
                pedidoRepository.save(pedido);
                log.info("Pedido {} actualizado a CONFIRMADO tras stock-reservado", pedidoId);
            }
        } catch (Exception e) {
            log.error("Error procesando stock-reservado: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "stock-liberado", groupId = "grupo-pedidos")
    public void listenStockLiberado(String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);
            String pedidoId = node.has("pedidoId") ? node.get("pedidoId").asText() : null;

            if (pedidoId == null) {
                log.warn("No se recibió pedidoId en stock-liberado: {}", payload);
                return;
            }

            Pedido pedido = pedidoRepository.findById(Long.valueOf(pedidoId)).orElse(null);
            if (pedido == null) {
                log.warn("No se encontró el pedido {} para procesar stock-liberado", pedidoId);
                return;
            }

            if (pedido.getEstado() == EstadoPedido.CONFIRMADO || pedido.getEstado() == EstadoPedido.PENDIENTE) {
                pedido.registrarCambioEstado(EstadoPedido.CANCELADO, "Stock liberado en inventario");
                pedidoRepository.save(pedido);
                log.info("Pedido {} actualizado a CANCELADO tras stock-liberado", pedidoId);
            }
        } catch (Exception e) {
            log.error("Error procesando stock-liberado: {}", e.getMessage(), e);
        }
    }
}
