package com.smartlogix.Productos.controller;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public ResponseEntity<Page<ProductoResponseDTO>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);

        return ResponseEntity.ok(service.listarProductos(pageable));
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<?> obtener(@PathVariable String sku) {

        try {
            ProductoResponseDTO producto = service.obtenerPorSku(sku);
            return ResponseEntity.ok(producto);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(404)
                    .body("Producto con SKU " + sku + " no existe");
        }
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<Page<ProductoResponseDTO>> porCategoria(
            @PathVariable String categoria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);

        return ResponseEntity.ok(service.porCategoria(categoria, pageable));
    }

    @PutMapping("/{sku}")
    public ResponseEntity<?> actualizar(
            @PathVariable String sku,
            @RequestBody ProductoRequestDTO dto) {

        try {
            return ResponseEntity.ok(service.actualizar(sku, dto));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}