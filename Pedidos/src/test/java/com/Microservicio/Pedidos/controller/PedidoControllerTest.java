package com.Microservicio.Pedidos.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.Microservicio.Pedidos.dto.ActualizarEstadoRequest;
import com.Microservicio.Pedidos.dto.CancelarPedidoRequest;
import com.Microservicio.Pedidos.dto.CrearPedidoRequest;
import com.Microservicio.Pedidos.dto.PedidoResponse;
import com.Microservicio.Pedidos.model.EstadoPedido;
import com.Microservicio.Pedidos.service.PedidoService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class PedidoControllerTest {

    @Mock
    private PedidoService pedidoService;

    @InjectMocks
    private PedidoController pedidoController;

    @Test
    void crearPedido_retorna201() {
        CrearPedidoRequest request = CrearPedidoRequest.builder().usuarioId(10L).build();
        PedidoResponse response = PedidoResponse.builder().id(1L).estado(EstadoPedido.PENDIENTE).build();
        when(pedidoService.crearPedido(request)).thenReturn(response);

        ResponseEntity<PedidoResponse> result = pedidoController.crearPedido(request);

        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        assertEquals(1L, result.getBody().getId());
    }

    @Test
    void listarPedidos_retorna200() {
        when(pedidoService.listarPedidos(10L, false))
                .thenReturn(List.of(PedidoResponse.builder().id(1L).build()));

        ResponseEntity<List<PedidoResponse>> result = pedidoController.listarPedidos(10L, false);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(1, result.getBody().size());
    }

    @Test
    void obtenerPedido_retorna200() {
        when(pedidoService.obtenerPedido(1L, 10L, false))
                .thenReturn(PedidoResponse.builder().id(1L).build());

        ResponseEntity<PedidoResponse> result = pedidoController.obtenerPedido(1L, 10L, false);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(1L, result.getBody().getId());
    }

    @Test
    void cancelarPedido_retorna200() {
        CancelarPedidoRequest request = CancelarPedidoRequest.builder().motivo("x").build();
        when(pedidoService.cancelarPedido(1L, 10L, false, request))
                .thenReturn(PedidoResponse.builder().id(1L).estado(EstadoPedido.CANCELADO).build());

        ResponseEntity<PedidoResponse> result = pedidoController.cancelarPedido(1L, 10L, false, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(EstadoPedido.CANCELADO, result.getBody().getEstado());
    }

    @Test
    void actualizarEstado_retorna200() {
        ActualizarEstadoRequest request = ActualizarEstadoRequest.builder().nuevoEstado(EstadoPedido.ENVIADO).build();
        when(pedidoService.actualizarEstado(1L, request))
                .thenReturn(PedidoResponse.builder().id(1L).estado(EstadoPedido.ENVIADO).build());

        ResponseEntity<PedidoResponse> result = pedidoController.actualizarEstado(1L, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(EstadoPedido.ENVIADO, result.getBody().getEstado());
        verify(pedidoService).actualizarEstado(1L, request);
    }
}
