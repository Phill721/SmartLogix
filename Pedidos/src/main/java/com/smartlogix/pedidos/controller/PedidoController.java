package com.smartlogix.pedidos.controller;

import com.smartlogix.pedidos.dto.*;
import com.smartlogix.pedidos.service.PedidoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<PedidoResponseDTO> crearPedido(
            @Valid @RequestBody CrearPedidoRequestDTO request,
            HttpServletRequest httpRequest
    ) {
        Long usuarioId = (Long) httpRequest.getAttribute("usuarioId");
        log.info("Crear pedido solicitado por usuario: {}", usuarioId);

        if (usuarioId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        PedidoResponseDTO pedido = pedidoService.crearPedido(usuarioId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
    }

    @PostMapping("/{pedidoId}/confirmar")
    public ResponseEntity<PedidoResponseDTO> confirmarPedido(
            @PathVariable Long pedidoId,
            HttpServletRequest httpRequest
    ) {
        Long usuarioId = (Long) httpRequest.getAttribute("usuarioId");
        log.info("Confirmar pedido: {} solicitado por usuario: {}", pedidoId, usuarioId);

        if (usuarioId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        PedidoResponseDTO pedido = pedidoService.confirmarPedido(pedidoId, usuarioId);
        return ResponseEntity.ok(pedido);
    }

    @PostMapping("/{pedidoId}/cancelar")
    public ResponseEntity<PedidoResponseDTO> cancelarPedido(
            @PathVariable Long pedidoId,
            HttpServletRequest httpRequest
    ) {
        Long usuarioId = (Long) httpRequest.getAttribute("usuarioId");
        log.info("Cancelar pedido: {} solicitado por usuario: {}", pedidoId, usuarioId);

        if (usuarioId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        PedidoResponseDTO pedido = pedidoService.cancelarPedido(pedidoId, usuarioId);
        return ResponseEntity.ok(pedido);
    }

    @GetMapping("/{pedidoId}")
    public ResponseEntity<PedidoResponseDTO> obtenerPedido(
            @PathVariable Long pedidoId,
            HttpServletRequest httpRequest
    ) {
        Long usuarioId = (Long) httpRequest.getAttribute("usuarioId");
        log.info("Obtener pedido: {} solicitado por usuario: {}", pedidoId, usuarioId);

        if (usuarioId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        PedidoResponseDTO pedido = pedidoService.obtenerPedido(pedidoId, usuarioId);
        return ResponseEntity.ok(pedido);
    }

    @GetMapping
    public ResponseEntity<PageResponse<PedidoListaResponseDTO>> listarPedidos(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) String estado,
            HttpServletRequest httpRequest
    ) {
        Long usuarioId = (Long) httpRequest.getAttribute("usuarioId");
        log.info("Listar pedidos solicitado por usuario: {}", usuarioId);

        if (usuarioId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        PageResponse<PedidoListaResponseDTO> pedidos;
        if (estado != null && !estado.isEmpty()) {
            pedidos = pedidoService.listarPedidosPorUsuarioYEstado(usuarioId, estado, page, size);
        } else {
            pedidos = pedidoService.listarPedidosPorUsuario(usuarioId, page, size);
        }

        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/admin/todos")
    public ResponseEntity<PageResponse<PedidoListaResponseDTO>> listarTodos(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            HttpServletRequest httpRequest
    ) {
        Long usuarioId = (Long) httpRequest.getAttribute("usuarioId");
        log.info("Listar todos los pedidos solicitado por usuario: {}", usuarioId);

        if (usuarioId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        PageResponse<PedidoListaResponseDTO> pedidos = pedidoService.listarTodos(page, size);
        return ResponseEntity.ok(pedidos);
    }
}
