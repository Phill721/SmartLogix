package com.smartlogix.inventario;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class InventarioApplication {
    public static void main(String[] args) {
        SpringApplication.run(InventarioApplication.class, args);
    }
}