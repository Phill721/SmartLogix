package com.smartlogix.Productos.controller;

import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService service;

    public ProductoController(ProductoService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR')")
    public ResponseEntity<ProductoResponseDTO> crear(
            @Valid @RequestBody ProductoRequestDTO dto
    ) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.crearProducto(dto));
    }
    @GetMapping
    public ResponseEntity<Page<ProductoResponseDTO>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        return ResponseEntity.ok(service.listarProductos(page, size));
    }

    @GetMapping("/{sku}")
    public ResponseEntity<ProductoResponseDTO> obtener(
            @PathVariable String sku
    ) {

        return ResponseEntity.ok(service.obtenerPorSku(sku));
    }
    @GetMapping("/buscar/nombre")
    public ResponseEntity<Page<ProductoResponseDTO>> buscarPorNombre(
            @RequestParam String nombre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        return ResponseEntity.ok(
                service.buscarPorNombre(nombre, page, size)
        );
    }

    @GetMapping("/buscar/categoria")
    public ResponseEntity<Page<ProductoResponseDTO>> buscarPorCategoria(
            @RequestParam String categoria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        return ResponseEntity.ok(
                service.buscarPorCategoria(categoria, page, size)
        );
    }

    @GetMapping("/buscar/precio")
    public ResponseEntity<Page<ProductoResponseDTO>> buscarPorPrecio(
            @RequestParam BigDecimal min,
            @RequestParam BigDecimal max,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        return ResponseEntity.ok(
                service.buscarPorPrecio(min, max, page, size)
        );
    }

    @PutMapping("/{sku}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR')")
    public ResponseEntity<ProductoResponseDTO> actualizar(
            @PathVariable String sku,
            @Valid @RequestBody ProductoRequestDTO dto
    ) {

        return ResponseEntity.ok(service.actualizar(sku, dto));
    }

    @DeleteMapping("/{sku}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(
            @PathVariable String sku
    ) {

        service.eliminar(sku);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/exists/{sku}")
    public ResponseEntity<Void> existeSku(
            @PathVariable String sku
    ) {

        service.obtenerPorSku(sku);

        return ResponseEntity.ok().build();
    }
}