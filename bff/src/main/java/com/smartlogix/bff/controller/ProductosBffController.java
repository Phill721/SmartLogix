package com.smartlogix.bff.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartlogix.bff.client.InventarioClient;
import com.smartlogix.bff.client.ProductosClient;
import com.smartlogix.bff.dto.InventarioDTO;
import com.smartlogix.bff.dto.PageResponseDTO;
import com.smartlogix.bff.dto.ProductoCompletoDTO;
import com.smartlogix.bff.dto.ProductoRequestDTO;
import com.smartlogix.bff.dto.ProductoResponseDTO;

@RestController
@RequestMapping("/api/bff/productos")
public class ProductosBffController {

    private final ProductosClient productosClient;
    private final InventarioClient inventarioClient;

    public ProductosBffController(
            ProductosClient productosClient,
            InventarioClient inventarioClient
    ) {
        this.productosClient = productosClient;
        this.inventarioClient = inventarioClient;
    }

    @GetMapping
    public PageResponseDTO<ProductoResponseDTO> listar(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        return productosClient.listarProductos(
                token,
                page,
                size
        );
    }

    @GetMapping("/{sku}")
    public ProductoResponseDTO obtener(
                @RequestHeader("Authorization") String token,
            @PathVariable String sku
    ) {

        return productosClient.obtenerPorSku(token, sku);
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

    @GetMapping("/buscar/nombre")
    public PageResponseDTO<ProductoResponseDTO> buscarPorNombre(
                @RequestHeader("Authorization") String token,
            @RequestParam String nombre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        return productosClient.buscarPorNombre(
                token,
                nombre,
                page,
                size
        );
    }

     @PutMapping("/{sku}")
    public ProductoResponseDTO actualizar(
            @RequestHeader("Authorization") String token,
            @PathVariable String sku,
            @RequestBody ProductoRequestDTO dto
    ) {

        return productosClient.actualizarProducto(
                token,
                sku,
                dto
        );
    }

    @DeleteMapping("/{sku}")
    public void eliminar(
            @RequestHeader("Authorization") String token,
            @PathVariable String sku
    ) {

        productosClient.eliminarProducto(token, sku);
    }

     @GetMapping("/buscar/categoria")
    public PageResponseDTO<ProductoResponseDTO> listarPorCategoria(
            @RequestHeader("Authorization") String token,
            @RequestParam String categoria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        return productosClient.listarPorCategoria(
                token,
                categoria,
                page,
                size
        );
    }

    @GetMapping("/completo/{sku}")
    public ProductoCompletoDTO obtenerCompleto(
            @PathVariable String sku,
             @RequestHeader("Authorization") String token
    ) {

        ProductoResponseDTO producto
                = productosClient.obtenerPorSku(token, sku);

        InventarioDTO inventario
                = inventarioClient.obtenerPorSku(token, sku);

        return ProductoCompletoDTO.builder()
                .producto(producto)
                .inventario(inventario)
                .build();
    }
}
