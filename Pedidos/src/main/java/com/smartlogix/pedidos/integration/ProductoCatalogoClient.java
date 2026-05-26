package com.smartlogix.pedidos.integration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.smartlogix.pedidos.exception.CircuitBreakerAbiertoException;
import com.smartlogix.pedidos.exception.ProductoNoEncontradoException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ProductoCatalogoClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.productos.base-url:http://localhost:8084}")
    private String productosBaseUrl;

    public void validarSkuExistente(String sku) {
        String url = productosBaseUrl + "/api/productos/exists/{sku}";
        // Construir headers y reenviar Authorization si existe en la petición entrante
        HttpHeaders headers = new HttpHeaders();
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null && attrs.getRequest() != null) {
            String auth = attrs.getRequest().getHeader("Authorization");
            if (auth != null) {
                headers.set("Authorization", auth);
            }
        }

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            HttpStatusCode status = restTemplate.exchange(url, HttpMethod.GET, entity, Void.class, sku).getStatusCode();
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