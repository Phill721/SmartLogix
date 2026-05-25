package com.smartlogix.pedidos.integration;

import com.smartlogix.pedidos.exception.CircuitBreakerAbiertoException;
import com.smartlogix.pedidos.exception.ProductoNoEncontradoException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class ProductoCatalogoClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.productos.base-url:http://localhost:8084}")
    private String productosBaseUrl;

    public void validarSkuExistente(String sku) {
        String url = productosBaseUrl + "/api/productos/exists/{sku}";

        try {
            HttpStatusCode status = restTemplate.getForEntity(url, Void.class, sku).getStatusCode();
            if (!status.is2xxSuccessful()) {
                throw new ProductoNoEncontradoException("El SKU no existe: " + sku);
            }
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ProductoNoEncontradoException("El SKU no existe: " + sku);
        } catch (RestClientException ex) {
            log.error("Error validando SKU {} contra Productos: {}", sku, ex.getMessage());
            throw new CircuitBreakerAbiertoException("El servicio de productos no está disponible. Intente más tarde.");
        }
    }
}