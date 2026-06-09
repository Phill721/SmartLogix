package com.smartlogix.Productos.exception;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void deberiaManejarProductoNoEncontrado() {
        ResponseEntity<?> respuesta = handler.manejarProductoNoEncontrado(
                new ProductoNotFoundException("Producto no encontrado")
        );

        assertEquals(HttpStatus.NOT_FOUND, respuesta.getStatusCode());
        assertTrue(respuesta.getBody() instanceof Map);
        Map<?, ?> body = (Map<?, ?>) respuesta.getBody();
        assertEquals("Producto no encontrado", body.get("error"));
        assertNotNull(body.get("timestamp"));
    }

    @Test
    void deberiaManejarSkuDuplicado() {
        ResponseEntity<?> respuesta = handler.manejarSkuDuplicado(
                new SkuDuplicadoException("SKU duplicado")
        );

        assertEquals(HttpStatus.BAD_REQUEST, respuesta.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) respuesta.getBody();
        assertEquals("SKU duplicado", body.get("error"));
        assertNotNull(body.get("timestamp"));
    }

    @Test
    void deberiaManejarValidaciones() {
        BindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "productoRequestDTO");
        bindingResult.addError(new FieldError("productoRequestDTO", "nombre", "El nombre es obligatorio"));

        MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
        when(exception.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<?> respuesta = handler.manejarValidaciones(exception);

        assertEquals(HttpStatus.BAD_REQUEST, respuesta.getStatusCode());
        assertTrue(respuesta.getBody() instanceof Map);
        Map<?, ?> body = (Map<?, ?>) respuesta.getBody();
        assertEquals("El nombre es obligatorio", body.get("nombre"));
    }
}
