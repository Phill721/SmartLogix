package com.smartlogix.pedidos.config;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Slf4j
@Configuration
public class CircuitBreakerConfigClass {

    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        CircuitBreakerRegistry registry = CircuitBreakerRegistry.of(
                CircuitBreakerConfig.custom()
                        .slidingWindowSize(10)
                        .failureRateThreshold(50.0f)
                        .waitDurationInOpenState(Duration.ofSeconds(10))
                        .permittedNumberOfCallsInHalfOpenState(3)
                        .build()
        );

        registry.getEventPublisher()
                .onEntryAdded(event -> log.info("CircuitBreaker added: {}", event.getAddedEntry().getName()))
                .onEntryRemoved(event -> log.info("CircuitBreaker removed: {}", event.getRemovedEntry().getName()));

        return registry;
    }

    @Bean
    public CircuitBreaker inventarioCircuitBreaker(CircuitBreakerRegistry registry) {
        return registry.circuitBreaker("inventario", 
                CircuitBreakerConfig.custom()
                        .slidingWindowSize(10)
                        .failureRateThreshold(50.0f)
                        .waitDurationInOpenState(Duration.ofSeconds(10))
                        .permittedNumberOfCallsInHalfOpenState(3)
                        .build()
        );
    }
}
