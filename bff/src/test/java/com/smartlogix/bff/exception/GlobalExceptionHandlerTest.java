package com.Microservicio.Pedidos.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleNotFound_retorna404() {
        ResponseEntity<Map<String, Object>> response = handler.handleNotFound(new RecursoNoEncontradoException("No existe"));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals(404, response.getBody().get("status"));
    }

    @Test
    void handleForbidden_retorna403() {
        ResponseEntity<Map<String, Object>> response = handler.handleForbidden(new AccesoDenegadoException("Sin acceso"));

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals(403, response.getBody().get("status"));
    }

    @Test
    void handleUnprocessable_retorna422() {
        ResponseEntity<Map<String, Object>> response = handler.handleUnprocessable(new EstadoInvalidoException("Transición inválida"));

        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, response.getStatusCode());
        assertEquals(422, response.getBody().get("status"));
    }

    @Test
    void handleGeneral_retorna500() {
        ResponseEntity<Map<String, Object>> response = handler.handleGeneral(new RuntimeException("boom"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(500, response.getBody().get("status"));
    }
}
