package com.smartlogix.inventario.kafka;

import com.smartlogix.inventario.entity.Inventario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class InventarioKafkaProducerTest {

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private InventarioKafkaProducer producer;

    @Captor
    private ArgumentCaptor<Map<String, Object>> mensajeCaptor;

    @BeforeEach
    void setUp() {
    }

    @Test
    void enviarAlertaStockBajo_enviaMensajeConElStockDisponibleYUmbral() {
        Inventario inventario = Inventario.builder()
                .sku("SKU-ALERTA")
                .stockTotal(20)
                .stockReservado(15)
                .umbralMinimo(10)
                .build();

        given(kafkaTemplate.send(eq("stock-bajo"), eq("SKU-ALERTA"), any(Map.class)))
                .willReturn(null);

        producer.enviarAlertaStockBajo(inventario);

        then(kafkaTemplate).should().send(eq("stock-bajo"), eq("SKU-ALERTA"), mensajeCaptor.capture());

        Map<String, Object> mensaje = mensajeCaptor.getValue();
        assertThat(mensaje).containsEntry("sku", "SKU-ALERTA");
        assertThat(mensaje).containsEntry("stockActual", 5);
        assertThat(mensaje).containsEntry("umbral", 10);
    }

    @Test
    void enviarEventoActualizacion_enviaActualizacionDeStock() {
        Inventario inventario = Inventario.builder()
                .sku("SKU-EVENTO")
                .stockTotal(50)
                .stockReservado(30)
                .build();

        given(kafkaTemplate.send(eq("inventario-actualizado"), eq("SKU-EVENTO"), any(Map.class)))
                .willReturn(null);

        producer.enviarEventoActualizacion(inventario);

        then(kafkaTemplate).should().send(eq("inventario-actualizado"), eq("SKU-EVENTO"), mensajeCaptor.capture());

        Map<String, Object> mensaje = mensajeCaptor.getValue();
        assertThat(mensaje).containsEntry("sku", "SKU-EVENTO");
        assertThat(mensaje).containsEntry("stockDisponible", 20);
        assertThat(mensaje).containsEntry("stockReservado", 30);
    }
}
