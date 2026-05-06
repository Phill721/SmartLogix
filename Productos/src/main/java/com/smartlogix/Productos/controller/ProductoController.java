package com.smartlogix.Productos.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartlogix.Productos.dto.ProductoRequestDTO;
import com.smartlogix.Productos.dto.ProductoResponseDTO;
import com.smartlogix.Productos.service.ProductoService;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService service;

    public ProductoController(ProductoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ProductoResponseDTO> crear(@RequestBody ProductoRequestDTO dto) {
        return ResponseEntity.ok(service.crearProducto(dto));
    }

    @GetMapping
    public ResponseEntity<List<ProductoResponseDTO>> listar() {
        return ResponseEntity.ok(service.listarProductos());
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<ProductoResponseDTO> obtener(@PathVariable String sku) {
        return ResponseEntity.ok(service.obtenerPorSku(sku));
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<ProductoResponseDTO>> porCategoria(@PathVariable String categoria) {
        return ResponseEntity.ok(service.porCategoria(categoria));
    }

    @PutMapping("/{sku}")
    public ResponseEntity<ProductoResponseDTO> actualizar(
            @PathVariable String sku,
            @RequestBody ProductoRequestDTO dto) {
        return ResponseEntity.ok(service.actualizar(sku, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}