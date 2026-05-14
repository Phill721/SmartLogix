package com.smartlogix.pedidos.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.grpc.Channel;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

@Configuration
public class GrpcConfig {

    @Value("${grpc.inventory.host:localhost}")
    private String inventoryHost;

    @Value("${grpc.inventory.port:9090}")
    private int inventoryPort;

    @Bean
    public ManagedChannel inventoryChannel() {
        return ManagedChannelBuilder
                .forAddress(inventoryHost, inventoryPort)
                .usePlaintext()
                .build();
    }
}
