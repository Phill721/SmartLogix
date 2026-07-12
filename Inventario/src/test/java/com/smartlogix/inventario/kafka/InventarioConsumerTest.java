package com.smartlogix.inventario.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.inventario.service.InventarioService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class InventarioConsumerTest {

    @Mock
    private InventarioService inventarioService;

    @InjectMocks
    private InventarioConsumer inventarioConsumer;

    @Test
    void listenPedidoCreado_shouldReserveStockForEachItem() throws Exception {
        inventarioConsumer = new InventarioConsumer(inventarioService, new ObjectMapper());

        String payload = """
                {
                  "pedidoId": 42,
                  "usuarioId": 7,
                  "estado": "PENDIENTE",
                  "items": [
                    {"sku": "SKU-001", "cantidad": 2},
                    {"sku": "SKU-002", "cantidad": 3}
                  ]
                }
                """;

        inventarioConsumer.listenPedidoCreado(payload);

        verify(inventarioService).reservarStock("SKU-001", 2, "42");
        verify(inventarioService).reservarStock("SKU-002", 3, "42");
    }
}
