package com.smartlogix.bff.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.smartlogix.bff.dto.ProductoResponseDTO;

@Service
public class ProductosClient {

    private final RestClient restClient;

    public ProductosClient(
            @Value("${productos.url}") String productosUrl
    ) {

        this.restClient = RestClient.builder()
                .baseUrl(productosUrl)
                .build();
    }

    public Page<ProductoResponseDTO> listarProductos(
            int page,
            int size
    ) {

        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/productos")
                        .queryParam("page", page)
                        .queryParam("size", size)
                        .build()
                )
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }


    public ProductoResponseDTO obtenerPorSku(String sku) {

        return restClient.get()
                .uri("/api/productos/{sku}", sku)
                .retrieve()
                .body(ProductoResponseDTO.class);
    }

    public ProductoResponseDTO crearProducto(
            String token,
            Object dto
    ) {

        return restClient.post()
                .uri("/api/productos")
                .header("Authorization", token)
                .body(dto)
                .retrieve()
                .body(ProductoResponseDTO.class);
    }
}