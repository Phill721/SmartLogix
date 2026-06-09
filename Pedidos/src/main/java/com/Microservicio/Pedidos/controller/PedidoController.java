package com.Microservicio.Pedidos.controller;

import com.Microservicio.Pedidos.dto.ActualizarEstadoRequest;
import com.Microservicio.Pedidos.dto.CancelarPedidoRequest;
import com.Microservicio.Pedidos.dto.CrearPedidoRequest;
import com.Microservicio.Pedidos.dto.PedidoResponse;
import com.Microservicio.Pedidos.service.PedidoService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<PedidoResponse> crearPedido(@RequestBody CrearPedidoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoService.crearPedido(request));
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listarPedidos(
            @RequestParam Long usuarioId,
            @RequestParam(defaultValue = "false") boolean esAdmin
    ) {
        return ResponseEntity.ok(pedidoService.listarPedidos(usuarioId, esAdmin));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> obtenerPedido(
            @PathVariable Long id,
            @RequestParam Long usuarioId,
            @RequestParam(defaultValue = "false") boolean esAdmin
    ) {
        return ResponseEntity.ok(pedidoService.obtenerPedido(id, usuarioId, esAdmin));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<PedidoResponse> cancelarPedido(
            @PathVariable Long id,
            @RequestParam Long usuarioId,
            @RequestParam(defaultValue = "false") boolean esAdmin,
            @RequestBody(required = false) CancelarPedidoRequest request
    ) {
        return ResponseEntity.ok(pedidoService.cancelarPedido(id, usuarioId, esAdmin, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PedidoResponse> actualizarEstado(
            @PathVariable Long id,
            @RequestBody ActualizarEstadoRequest request
    ) {
        return ResponseEntity.ok(pedidoService.actualizarEstado(id, request));
    }
}
