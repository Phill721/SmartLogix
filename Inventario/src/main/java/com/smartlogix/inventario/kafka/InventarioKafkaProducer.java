package com.smartlogix.inventario.kafka;

import com.smartlogix.inventario.entity.Inventario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventarioKafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void enviarAlertaStockBajo(Inventario inventario) {
        Map<String, Object> mensaje = new HashMap<>();
        mensaje.put("sku", inventario.getSku());
        mensaje.put("stockActual", inventario.getStockDisponible());
        mensaje.put("umbral", inventario.getUmbralMinimo());

        kafkaTemplate.send("stock-bajo", inventario.getSku(), mensaje)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.warn("Error al enviar alerta de stock bajo para SKU: {}", inventario.getSku(), ex);
                    } else {
                        log.info("Alerta de stock bajo enviada para SKU: {}", inventario.getSku());
                    }
                });
    }

    public void enviarEventoActualizacion(Inventario inventario) {
        Map<String, Object> mensaje = new HashMap<>();
        mensaje.put("sku", inventario.getSku());
        mensaje.put("stockDisponible", inventario.getStockDisponible());
        mensaje.put("stockReservado", inventario.getStockReservado());

        kafkaTemplate.send("inventario-actualizado", inventario.getSku(), mensaje)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.warn("Error al enviar evento de actualización para SKU: {}", inventario.getSku(), ex);
                    }
                });
    }
}