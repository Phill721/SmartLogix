package com.smartlogix.pedidos.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handlePedidoNotFound_devuelveNotFound() {
        PedidoNotFoundException ex = new PedidoNotFoundException("no existe");
        ResponseEntity<Map<String, Object>> resp = handler.handlePedidoNotFound(ex);
        assertEquals(org.springframework.http.HttpStatus.NOT_FOUND, resp.getStatusCode());
        assertEquals("Pedido no encontrado", resp.getBody().get("error"));
    }

    @Test
    void handleStockInsuficiente_devuelveConflict() {
        StockInsuficienteException ex = new StockInsuficienteException("sin stock");
        ResponseEntity<Map<String, Object>> resp = handler.handleStockInsuficiente(ex);
        assertEquals(org.springframework.http.HttpStatus.CONFLICT, resp.getStatusCode());
        assertEquals("Stock insuficiente", resp.getBody().get("error"));
    }

    @Test
    void handleProductoNoEncontrado_devuelveNotFound() {
        ProductoNoEncontradoException ex = new ProductoNoEncontradoException("sku");
        ResponseEntity<Map<String, Object>> resp = handler.handleProductoNoEncontrado(ex);
        assertEquals(org.springframework.http.HttpStatus.NOT_FOUND, resp.getStatusCode());
    }

    @Test
    void handleCarritoNoEncontrado_devuelveNotFound() {
        CarritoNoEncontradoException ex = new CarritoNoEncontradoException("c");
        ResponseEntity<Map<String, Object>> resp = handler.handleCarritoNoEncontrado(ex);
        assertEquals(org.springframework.http.HttpStatus.NOT_FOUND, resp.getStatusCode());
    }

    @Test
    void handleCircuitBreakerAbierto_devuelve503() {
        CircuitBreakerAbiertoException ex = new CircuitBreakerAbiertoException("cb");
        ResponseEntity<Map<String, Object>> resp = handler.handleCircuitBreakerAbierto(ex);
        assertEquals(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, resp.getStatusCode());
    }

    @Test
    void handleCarritoVacio_devuelve400() {
        CarritoVacioException ex = new CarritoVacioException("v");
        ResponseEntity<Map<String, Object>> resp = handler.handleCarritoVacio(ex);
        assertEquals(org.springframework.http.HttpStatus.BAD_REQUEST, resp.getStatusCode());
    }

    @Test
    void handleEstadoInvalido_devuelve400() {
        EstadoPedidoInvalidoException ex = new EstadoPedidoInvalidoException("e");
        ResponseEntity<Map<String, Object>> resp = handler.handleEstadoInvalido(ex);
        assertEquals(org.springframework.http.HttpStatus.BAD_REQUEST, resp.getStatusCode());
    }

    @Test
    void handleValidationException_agregaErrores() {
        BindingResult binding = mock(BindingResult.class);
        FieldError fe = new FieldError("obj", "field", "must not be null");
        when(binding.getFieldErrors()).thenReturn(java.util.List.of(fe));
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(binding);

        ResponseEntity<java.util.Map<String, Object>> resp = handler.handleValidationException(ex);
        assertEquals(org.springframework.http.HttpStatus.BAD_REQUEST, resp.getStatusCode());
        assertTrue(((Map)resp.getBody().get("errors")).containsKey("field"));
    }

    @Test
    void handleGlobalException_devuelve500() {
        Exception ex = new Exception("x");
        ResponseEntity<java.util.Map<String, Object>> resp = handler.handleGlobalException(ex);
        assertEquals(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, resp.getStatusCode());
    }
}
