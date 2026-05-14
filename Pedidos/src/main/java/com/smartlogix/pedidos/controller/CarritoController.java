package com.smartlogix.pedidos.controller;

import com.smartlogix.pedidos.dto.AgregarAlCarritoRequestDTO;
import com.smartlogix.pedidos.dto.CarritoResponseDTO;
import com.smartlogix.pedidos.service.CarritoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    @GetMapping
    public ResponseEntity<CarritoResponseDTO> obtenerCarrito(HttpServletRequest httpRequest) {
        Long usuarioId = (Long) httpRequest.getAttribute("usuarioId");
        log.info("Obtener carrito solicitado por usuario: {}", usuarioId);

        if (usuarioId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CarritoResponseDTO carrito = carritoService.obtenerCarritoPorUsuario(usuarioId);
        return ResponseEntity.ok(carrito);
    }

    @PostMapping("/agregar")
    public ResponseEntity<CarritoResponseDTO> agregarAlCarrito(
            @Valid @RequestBody AgregarAlCarritoRequestDTO request,
            HttpServletRequest httpRequest
    ) {
        Long usuarioId = (Long) httpRequest.getAttribute("usuarioId");
        log.info("Agregar al carrito solicitado por usuario: {}", usuarioId);

        if (usuarioId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CarritoResponseDTO carrito = carritoService.agregarAlCarrito(usuarioId, request);
        return ResponseEntity.ok(carrito);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CarritoResponseDTO> removerDelCarrito(
            @PathVariable Long itemId,
            HttpServletRequest httpRequest
    ) {
        Long usuarioId = (Long) httpRequest.getAttribute("usuarioId");
        log.info("Remover del carrito solicitado por usuario: {}", usuarioId);

        if (usuarioId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CarritoResponseDTO carrito = carritoService.removerDelCarrito(usuarioId, itemId);
        return ResponseEntity.ok(carrito);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CarritoResponseDTO> actualizarCantidad(
            @PathVariable Long itemId,
            @RequestParam Integer cantidad,
            HttpServletRequest httpRequest
    ) {
        Long usuarioId = (Long) httpRequest.getAttribute("usuarioId");
        log.info("Actualizar cantidad en carrito solicitado por usuario: {}", usuarioId);

        if (usuarioId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CarritoResponseDTO carrito = carritoService.actualizarCantidadItem(usuarioId, itemId, cantidad);
        return ResponseEntity.ok(carrito);
    }

    @DeleteMapping("/vaciar")
    public ResponseEntity<Void> vaciarCarrito(HttpServletRequest httpRequest) {
        Long usuarioId = (Long) httpRequest.getAttribute("usuarioId");
        log.info("Vaciar carrito solicitado por usuario: {}", usuarioId);

        if (usuarioId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        carritoService.vaciarCarrito(usuarioId);
        return ResponseEntity.noContent().build();
    }
}
