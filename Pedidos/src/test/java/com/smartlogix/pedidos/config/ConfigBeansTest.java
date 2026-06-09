package com.smartlogix.pedidos.config;

import io.grpc.ManagedChannel;
import org.springframework.test.util.ReflectionTestUtils;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ConfigBeansTest {

    @Test
    void circuitBreakerBeans_creanRegistryYArena() {
        CircuitBreakerConfigClass cfg = new CircuitBreakerConfigClass();
        CircuitBreakerRegistry registry = cfg.circuitBreakerRegistry();
        assertNotNull(registry);

        CircuitBreaker cb = cfg.inventarioCircuitBreaker(registry);
        assertNotNull(cb);
        assertEquals("inventario", cb.getName());
    }

    @Test
    void kafkaAndGrpcBeans_noNull() {
        KafkaProducerConfig kafka = new KafkaProducerConfig();
        // set bootstrapServers to avoid NullPointerException inside DefaultKafkaProducerFactory
        ReflectionTestUtils.setField(kafka, "bootstrapServers", "localhost:9092");
        assertNotNull(kafka.objectMapper());
        // producer factories should construct even si bootstrapServers es null
        assertNotNull(kafka.producerFactoryCreado());
        assertNotNull(kafka.producerFactoryCancelado());

        GrpcConfig grpc = new GrpcConfig();
        // Reflection to set @Value-injected fields when running outside Spring context
        ReflectionTestUtils.setField(grpc, "inventoryHost", "localhost");
        ReflectionTestUtils.setField(grpc, "inventoryPort", 9090);
        ManagedChannel channel = grpc.inventoryChannel();
        assertNotNull(channel);
        // no cerramos el canal explícitamente aquí
    }
}
