package com.smartlogix.bff.client;

import com.smartlogix.bff.dto.ProductoRequestDTO;
import com.smartlogix.bff.dto.ProductoResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@FeignClient(
        name = "productos-client",
        url = "${productos.url}"
)
public interface ProductosClient {

    @GetMapping("/api/productos")
    Page<ProductoResponseDTO> listarProductos(
            @RequestParam int page,
            @RequestParam int size
    );

    @GetMapping("/api/productos/{sku}")
    ProductoResponseDTO obtenerPorSku(
            @PathVariable String sku
    );

    @PostMapping("/api/productos")
    ProductoResponseDTO crearProducto(
            @RequestHeader("Authorization") String token,
            @RequestBody ProductoRequestDTO dto
    );
}