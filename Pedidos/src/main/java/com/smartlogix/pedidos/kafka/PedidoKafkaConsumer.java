package com.smartlogix.pedidos.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PedidoKafkaConsumer {

    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "stock-reservado", groupId = "grupo-pedidos")
    public void listenStockReservado(String payload) {
        try {
            log.info("Mensaje recibido en stock-reservado: {}", payload);
            // El pedido ya está confirmado cuando se envía el evento PedidoCreado
            // Este listener es para confirmar asincronamente la reserva
        } catch (Exception e) {
            log.error("Error procesando stock-reservado: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "stock-liberado", groupId = "grupo-pedidos")
    public void listenStockLiberado(String payload) {
        try {
            log.info("Mensaje recibido en stock-liberado: {}", payload);
            // Confirmar que la liberación fue exitosa
        } catch (Exception e) {
            log.error("Error procesando stock-liberado: {}", e.getMessage(), e);
        }
    }
}
