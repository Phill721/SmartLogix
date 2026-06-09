package com.smartlogix.pedidos.controller;

import com.smartlogix.pedidos.dto.CrearPedidoRequestDTO;
import com.smartlogix.pedidos.dto.PedidoListaResponseDTO;
import com.smartlogix.pedidos.dto.PedidoResponseDTO;
import com.smartlogix.pedidos.dto.PageResponse;
import com.smartlogix.pedidos.service.PedidoService;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PedidoControllerTest {

    @Mock
    private PedidoService pedidoService;

    @Mock
    private HttpServletRequest request;

    private PedidoController controller;

    @BeforeEach
    void setUp() {
        controller = new PedidoController(pedidoService);
    }

    @Test
    void crearPedido_retornaCreatedCuandoUsuarioAutenticado() {
        when(request.getAttribute("usuarioId")).thenReturn(100L);
        when(pedidoService.crearPedido(eq(100L), any(CrearPedidoRequestDTO.class)))
                .thenReturn(PedidoResponseDTO.builder()
                        .id(1L)
                        .usuarioId(100L)
                        .estado("PENDIENTE")
                        .total(new BigDecimal("20.00"))
                        .build());

        ResponseEntity<?> response = controller.crearPedido(CrearPedidoRequestDTO.builder().carritoId(1L).build(), request);

        assertEquals(org.springframework.http.HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void crearPedido_retornaUnauthorizedCuandoNoHayUsuario() {
        when(request.getAttribute("usuarioId")).thenReturn(null);

        ResponseEntity<?> response = controller.crearPedido(CrearPedidoRequestDTO.builder().carritoId(1L).build(), request);

        assertEquals(org.springframework.http.HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNull(response.getBody());
    }

    @Test
    void obtenerPedido_retornaOkCuandoUsuarioAutenticado() {
        when(request.getAttribute("usuarioId")).thenReturn(100L);
        when(pedidoService.obtenerPedido(1L, 100L)).thenReturn(PedidoResponseDTO.builder()
                .id(1L)
                .usuarioId(100L)
                .estado("PENDIENTE")
                .build());

        ResponseEntity<?> response = controller.obtenerPedido(1L, request);

        assertEquals(org.springframework.http.HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof PedidoResponseDTO);
    }

    @Test
    void listarPedidos_retornaOkYPagina() {
        when(request.getAttribute("usuarioId")).thenReturn(100L);
        PageResponse<PedidoListaResponseDTO> pageResponse = PageResponse.<PedidoListaResponseDTO>builder()
                .content(Collections.emptyList())
                .page(0)
                .size(20)
                .totalElements(0)
                .totalPages(0)
                .last(true)
                .build();
        when(pedidoService.listarPedidosPorUsuario(100L, 0, 20)).thenReturn(pageResponse);

        ResponseEntity<?> response = controller.listarPedidos(0, 20, null, request);

        assertEquals(org.springframework.http.HttpStatus.OK, response.getStatusCode());
        assertSame(pageResponse, response.getBody());
    }
}
