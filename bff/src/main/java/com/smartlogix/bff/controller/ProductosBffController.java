package com.smartlogix.bff.controller;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartlogix.bff.client.ProductosClient;
import com.smartlogix.bff.dto.ProductoRequestDTO;
import com.smartlogix.bff.dto.ProductoResponseDTO;

@RestController
@RequestMapping("/api/bff/productos")
public class ProductosBffController {

    private final ProductosClient productosClient;

    public ProductosBffController(
            ProductosClient productosClient
    ) {
        this.productosClient = productosClient;
    }

    @GetMapping
    public Page<ProductoResponseDTO> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        return productosClient.listarProductos(
                page,
                size
        );
    }

    @GetMapping("/{sku}")
    public ProductoResponseDTO obtener(
            @PathVariable String sku
    ) {

        return productosClient.obtenerPorSku(sku);
    }

    @PostMapping
    public ProductoResponseDTO crear(
            @RequestHeader("Authorization") String token,
            @RequestBody ProductoRequestDTO dto
    ) {

        return productosClient.crearProducto(
                token,
                dto
        );
    }
}