package com.smartlogix.bff.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.smartlogix.bff.dto.PageResponseDTO;
import com.smartlogix.bff.dto.ProductoRequestDTO;
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

    public PageResponseDTO<ProductoResponseDTO> listarProductos(
            String token,
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
                .header("Authorization", token)
                .retrieve()
                .body(new ParameterizedTypeReference<PageResponseDTO<ProductoResponseDTO>>() {});
    }

    public ProductoResponseDTO obtenerPorSku(String token, String sku) {

        return restClient.get()
                .uri("/api/productos/{sku}", sku)
                .header("Authorization", token)
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

    public PageResponseDTO<ProductoResponseDTO> buscarPorNombre(
            String token,
            String nombre,
            int page,
            int size
    ) {

        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/productos/buscar/nombre")
                        .queryParam("nombre", nombre)
                        .queryParam("page", page)
                        .queryParam("size", size)
                        .build()
                )
                .header("Authorization", token)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

     public ProductoResponseDTO actualizarProducto(
            String token,
            String sku,
            ProductoRequestDTO dto
    ) {

        return restClient.put()
                .uri("/api/productos/{sku}", sku)
                .header("Authorization", token)
                .body(dto)
                .retrieve()
                .body(ProductoResponseDTO.class);
    }

    public void eliminarProducto(
            String token,
            String sku
    ) {

        restClient.delete()
                .uri("/api/productos/{sku}", sku)
                .header("Authorization", token)
                .retrieve()
                .toBodilessEntity();
    }

    public PageResponseDTO<ProductoResponseDTO> listarPorCategoria(
            String token,
            String categoria,
            int page,
            int size
    ) {

        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/productos/buscar/categoria")
                        .queryParam("categoria", categoria)
                        .queryParam("page", page)
                        .queryParam("size", size)
                        .build(categoria)
                )
                .header("Authorization", token)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }
}
