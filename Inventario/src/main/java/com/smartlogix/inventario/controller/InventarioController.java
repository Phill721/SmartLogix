package com.smartlogix.inventario.controller;

import com.smartlogix.inventario.dto.*;
import com.smartlogix.inventario.entity.*;
import com.smartlogix.inventario.service.InventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;

    @PostMapping
    public ResponseEntity<Inventario> crear(@RequestBody InventarioRequest request) {
        return ResponseEntity.ok(inventarioService.crearInventario(request));
    }

    @GetMapping("/{sku}")
    public ResponseEntity<Inventario> obtenerPorSku(@PathVariable String sku) {
        return ResponseEntity.ok(inventarioService.obtenerPorSku(sku));
    }

    @GetMapping("/bodega/{bodegaId}")
    public ResponseEntity<List<Inventario>> obtenerPorBodega(@PathVariable Long bodegaId) {
        return ResponseEntity.ok(inventarioService.obtenerPorBodega(bodegaId));
    }

    @PatchMapping("/{id}/ajuste")
    public ResponseEntity<Inventario> ajustar(@PathVariable Long id, @RequestBody AjusteRequest request) {
        return ResponseEntity.ok(inventarioService.ajusteManual(id, request));
    }

    @GetMapping("/{id}/movimientos")
    public ResponseEntity<List<MovimientoInventario>> obtenerMovimientos(@PathVariable Long id) {
        return ResponseEntity.ok(inventarioService.obtenerMovimientos(id));
    }
}