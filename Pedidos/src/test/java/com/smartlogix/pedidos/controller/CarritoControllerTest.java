package com.smartlogix.pedidos.controller;

import com.smartlogix.pedidos.dto.AgregarAlCarritoRequestDTO;
import com.smartlogix.pedidos.dto.CarritoResponseDTO;
import com.smartlogix.pedidos.service.CarritoService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CarritoControllerTest {

    @Mock
    private CarritoService carritoService;

    @Mock
    private HttpServletRequest request;

    private CarritoController controller;

    @BeforeEach
    void setUp() {
        controller = new CarritoController(carritoService);
    }

    @Test
    void obtenerCarrito_autenticado_retornaOk() {
        when(request.getAttribute("usuarioId")).thenReturn(1L);
        CarritoResponseDTO dto = CarritoResponseDTO.builder()
                .id(1L)
                .usuarioId(1L)
                .items(Collections.emptyList())
                .total(new BigDecimal("0.00"))
                .fechaCreacion(LocalDateTime.now())
                .build();
        when(carritoService.obtenerCarritoPorUsuario(1L)).thenReturn(dto);

        ResponseEntity<CarritoResponseDTO> resp = controller.obtenerCarrito(request);

        assertEquals(org.springframework.http.HttpStatus.OK, resp.getStatusCode());
        assertSame(dto, resp.getBody());
    }

    @Test
    void obtenerCarrito_sinUsuario_retornaUnauthorized() {
        when(request.getAttribute("usuarioId")).thenReturn(null);

        ResponseEntity<CarritoResponseDTO> resp = controller.obtenerCarrito(request);

        assertEquals(org.springframework.http.HttpStatus.UNAUTHORIZED, resp.getStatusCode());
        assertNull(resp.getBody());
    }

    @Test
    void agregarAlCarrito_autenticado_retornaOk() {
        when(request.getAttribute("usuarioId")).thenReturn(2L);
        AgregarAlCarritoRequestDTO req = AgregarAlCarritoRequestDTO.builder()
                .sku("SKU1")
                .nombreProducto("Producto")
                .cantidad(2)
                .precioUnitario(new BigDecimal("10.00"))
                .build();

        CarritoResponseDTO dto = CarritoResponseDTO.builder().id(5L).usuarioId(2L).items(Collections.emptyList()).total(new BigDecimal("20.00")).build();
        when(carritoService.agregarAlCarrito(eq(2L), any(AgregarAlCarritoRequestDTO.class))).thenReturn(dto);

        ResponseEntity<CarritoResponseDTO> resp = controller.agregarAlCarrito(req, request);

        assertEquals(org.springframework.http.HttpStatus.OK, resp.getStatusCode());
        assertSame(dto, resp.getBody());
    }

    @Test
    void removerDelCarrito_autenticado_retornaOk() {
        when(request.getAttribute("usuarioId")).thenReturn(3L);
        CarritoResponseDTO dto = CarritoResponseDTO.builder().id(7L).usuarioId(3L).items(Collections.emptyList()).total(new BigDecimal("0.00")).build();
        when(carritoService.removerDelCarrito(3L, 10L)).thenReturn(dto);

        ResponseEntity<CarritoResponseDTO> resp = controller.removerDelCarrito(10L, request);

        assertEquals(org.springframework.http.HttpStatus.OK, resp.getStatusCode());
        assertSame(dto, resp.getBody());
    }

    @Test
    void actualizarCantidad_autenticado_retornaOk() {
        when(request.getAttribute("usuarioId")).thenReturn(4L);
        CarritoResponseDTO dto = CarritoResponseDTO.builder().id(8L).usuarioId(4L).items(Collections.emptyList()).total(new BigDecimal("0.00")).build();
        when(carritoService.actualizarCantidadItem(4L, 11L, 5)).thenReturn(dto);

        ResponseEntity<CarritoResponseDTO> resp = controller.actualizarCantidad(11L, 5, request);

        assertEquals(org.springframework.http.HttpStatus.OK, resp.getStatusCode());
        assertSame(dto, resp.getBody());
    }

    @Test
    void vaciarCarrito_autenticado_retornaNoContent() {
        when(request.getAttribute("usuarioId")).thenReturn(9L);

        ResponseEntity<Void> resp = controller.vaciarCarrito(request);

        assertEquals(org.springframework.http.HttpStatus.NO_CONTENT, resp.getStatusCode());
        verify(carritoService).vaciarCarrito(9L);
    }

    @Test
    void vaciarCarrito_sinUsuario_retornaUnauthorized() {
        when(request.getAttribute("usuarioId")).thenReturn(null);

        ResponseEntity<Void> resp = controller.vaciarCarrito(request);

        assertEquals(org.springframework.http.HttpStatus.UNAUTHORIZED, resp.getStatusCode());
    }
}
