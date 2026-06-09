package com.Microservicio.Pedidos;

import static org.mockito.Mockito.times;

import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.boot.SpringApplication;

class PedidosApplicationMainTest {

    @Test
    void main_debeInvocarSpringApplicationRun() {
        try (MockedStatic<SpringApplication> mocked = Mockito.mockStatic(SpringApplication.class)) {
            PedidosApplication.main(new String[]{});
            mocked.verify(() -> SpringApplication.run(PedidosApplication.class, new String[]{}), times(1));
        }
    }
}
