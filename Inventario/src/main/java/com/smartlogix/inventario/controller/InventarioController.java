package com.smartlogix.inventario.controller;

import com.smartlogix.inventario.dto.AjusteRequest;
import com.smartlogix.inventario.dto.InventarioRequest;
import com.smartlogix.inventario.dto.MovimientoDTO;
import com.smartlogix.inventario.entity.Inventario;
import com.smartlogix.inventario.entity.MovimientoInventario;
import com.smartlogix.inventario.service.InventarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR')")
    public ResponseEntity<Inventario> crear(@Valid @RequestBody InventarioRequest request, @RequestHeader("Authorization") String token) {
    
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crearInventario(token, request));
    }

    @GetMapping("/{sku}")
    public ResponseEntity<Inventario> obtenerPorSku(@PathVariable String sku) {
        return ResponseEntity.ok(service.obtenerPorSku(sku));
    }

    @GetMapping("/bodega/{bodegaId}")
    public ResponseEntity<List<Inventario>> obtenerPorBodega(@PathVariable Long bodegaId) {
        return ResponseEntity.ok(service.obtenerPorBodega(bodegaId));
    }

    @PostMapping("/{id}/ajuste")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Inventario> ajusteManual(@PathVariable Long id,
            @Valid @RequestBody AjusteRequest request) {
        return ResponseEntity.ok(service.ajusteManual(id, request));
    }

    @GetMapping("/{id}/movimientos")
    public ResponseEntity<List<MovimientoDTO>> obtenerMovimientos(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerMovimientos(id));
    }
}