package com.smartlogix.inventario.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

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

    public void validarSkuExiste(
        String token,
        String sku
) {

    restClient.get()
            .uri("/api/productos/exists/{sku}", sku)
            .header("Authorization", token)
            .retrieve()
            .toBodilessEntity();
}
}