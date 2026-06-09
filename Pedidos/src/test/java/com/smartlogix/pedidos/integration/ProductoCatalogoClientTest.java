package com.smartlogix.pedidos.integration;

import com.smartlogix.pedidos.exception.CircuitBreakerAbiertoException;
import com.smartlogix.pedidos.exception.ProductoNoEncontradoException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class ProductoCatalogoClientTest {

    private ProductoCatalogoClient client;
    private RestTemplate restTemplate;

    @BeforeEach
    void setUp() {
        client = new ProductoCatalogoClient();
        restTemplate = Mockito.mock(RestTemplate.class);
        ReflectionTestUtils.setField(client, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(client, "productosBaseUrl", "http://localhost:0");
    }

    @Test
    void validarSkuExistente_ok() {
        when(restTemplate.exchange(any(String.class), any(), any(), eq(Void.class), any(Object.class)))
                .thenReturn(new ResponseEntity<>(HttpStatus.OK));

        assertDoesNotThrow(() -> client.validarSkuExistente("SKU_OK"));
    }

    @Test
    void validarSkuExistente_notFound_lanzaProductoNoEncontrado() {
        when(restTemplate.exchange(any(String.class), any(), any(), eq(Void.class), any(Object.class)))
                .thenThrow(HttpClientErrorException.NotFound.create(HttpStatus.NOT_FOUND, "not found", null, null, null));

        assertThrows(ProductoNoEncontradoException.class, () -> client.validarSkuExistente("SKU_NO"));
    }

    @Test
    void validarSkuExistente_errorRest_lanzaCircuitBreakerAbierto() {
        when(restTemplate.exchange(any(String.class), any(), any(), eq(Void.class), any(Object.class)))
                .thenThrow(new RestClientException("boom"));

        assertThrows(CircuitBreakerAbiertoException.class, () -> client.validarSkuExistente("SKU_ERR"));
    }
}
