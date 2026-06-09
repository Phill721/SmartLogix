package com.smartlogix.pedidos.controller;

import com.smartlogix.pedidos.dto.PageResponse;
import com.smartlogix.pedidos.dto.PedidoListaResponseDTO;
import com.smartlogix.pedidos.dto.PedidoResponseDTO;
import com.smartlogix.pedidos.service.PedidoService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PedidoControllerExtraTest {

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
    void confirmarPedido_autenticado_retornaOk() {
        when(request.getAttribute("usuarioId")).thenReturn(42L);
        when(pedidoService.confirmarPedido(5L, 42L)).thenReturn(PedidoResponseDTO.builder().id(5L).usuarioId(42L).total(new BigDecimal("10.00")).build());

        ResponseEntity<PedidoResponseDTO> resp = controller.confirmarPedido(5L, request);

        assertEquals(org.springframework.http.HttpStatus.OK, resp.getStatusCode());
        assertTrue(resp.getBody() instanceof PedidoResponseDTO);
    }

    @Test
    void confirmarPedido_sinUsuario_retornaUnauthorized() {
        when(request.getAttribute("usuarioId")).thenReturn(null);

        ResponseEntity<PedidoResponseDTO> resp = controller.confirmarPedido(5L, request);

        assertEquals(org.springframework.http.HttpStatus.UNAUTHORIZED, resp.getStatusCode());
    }

    @Test
    void cancelarPedido_autenticado_retornaOk() {
        when(request.getAttribute("usuarioId")).thenReturn(50L);
        when(pedidoService.cancelarPedido(6L, 50L)).thenReturn(PedidoResponseDTO.builder().id(6L).usuarioId(50L).total(new BigDecimal("0.00")).build());

        ResponseEntity<PedidoResponseDTO> resp = controller.cancelarPedido(6L, request);

        assertEquals(org.springframework.http.HttpStatus.OK, resp.getStatusCode());
        assertNotNull(resp.getBody());
    }

    @Test
    void listarPedidos_conEstado_usaFiltrado() {
        when(request.getAttribute("usuarioId")).thenReturn(77L);
        PageResponse<PedidoListaResponseDTO> page = PageResponse.<PedidoListaResponseDTO>builder()
                .content(Collections.emptyList())
                .page(0)
                .size(20)
                .totalElements(0)
                .totalPages(0)
                .last(true)
                .build();
        when(pedidoService.listarPedidosPorUsuarioYEstado(77L, "PENDIENTE", 0, 20)).thenReturn(page);

        ResponseEntity<?> resp = controller.listarPedidos(0, 20, "PENDIENTE", request);

        assertEquals(org.springframework.http.HttpStatus.OK, resp.getStatusCode());
        assertSame(page, resp.getBody());
    }

    @Test
    void listarTodos_autenticado_retornaOk() {
        when(request.getAttribute("usuarioId")).thenReturn(88L);
        PageResponse<PedidoListaResponseDTO> page = PageResponse.<PedidoListaResponseDTO>builder().content(Collections.emptyList()).page(0).size(20).totalElements(0).totalPages(0).last(true).build();
        when(pedidoService.listarTodos(anyInt(), anyInt())).thenReturn(page);

        ResponseEntity<?> resp = controller.listarTodos(0, 20, request);

        assertEquals(org.springframework.http.HttpStatus.OK, resp.getStatusCode());
        assertSame(page, resp.getBody());
    }

    @Test
    void listarTodos_sinUsuario_retornaUnauthorized() {
        when(request.getAttribute("usuarioId")).thenReturn(null);

        ResponseEntity<?> resp = controller.listarTodos(0, 20, request);

        assertEquals(org.springframework.http.HttpStatus.UNAUTHORIZED, resp.getStatusCode());
    }
}
