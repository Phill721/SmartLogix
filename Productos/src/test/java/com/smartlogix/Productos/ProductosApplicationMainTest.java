package com.smartlogix.Productos;

import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

class ProductosApplicationMainTest {

    @Test
    void deberiaTenerAnotacionesDeAplicacionYEjecutarMain() {
        try (MockedStatic<SpringApplication> springApplication = Mockito.mockStatic(SpringApplication.class)) {
            ConfigurableApplicationContext context = Mockito.mock(ConfigurableApplicationContext.class);
            springApplication.when(() -> SpringApplication.run(eq(ProductosApplication.class), any(String[].class)))
                    .thenReturn(context);

            ProductosApplication.main(new String[]{});

            assertTrue(ProductosApplication.class.isAnnotationPresent(org.springframework.boot.autoconfigure.SpringBootApplication.class));
            assertTrue(ProductosApplication.class.isAnnotationPresent(org.springframework.cache.annotation.EnableCaching.class));
            assertTrue(ProductosApplication.class.isAnnotationPresent(org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity.class));
            springApplication.verify(() -> SpringApplication.run(eq(ProductosApplication.class), any(String[].class)));
        }
    }
}
