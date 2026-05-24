package com.smartlogix.bff.client;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.smartlogix.bff.dto.AjusteRequestDTO;
import com.smartlogix.bff.dto.InventarioDTO;
import com.smartlogix.bff.dto.InventarioRequestDTO;
import com.smartlogix.bff.dto.MovimientoDTO;

@Service
public class InventarioClient {

    private final RestClient restClient;

    public InventarioClient(
            @Value("${inventario.url}") String inventarioUrl
    ) {

        this.restClient = RestClient.builder()
                .baseUrl(inventarioUrl)
                .build();
    }

    public InventarioDTO crearInventario(
            String token,
            InventarioRequestDTO request
    ) {

        return restClient.post()
                .uri("/api/inventario")
                .header("Authorization", token)
                .body(request)
                .retrieve()
                .body(InventarioDTO.class);
    }

    public InventarioDTO obtenerPorSku(
            String token,
            String sku
    ) {

        return restClient.get()
                .uri("/api/inventario/{sku}", sku)
                .header("Authorization", token)
                .retrieve()
                .body(InventarioDTO.class);
    }

    public List<InventarioDTO> obtenerPorBodega(
            String token,
            Long bodegaId
    ) {

        return restClient.get()
                .uri("/api/inventario/bodega/{bodegaId}", bodegaId)
                .header("Authorization", token)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public InventarioDTO ajusteManual(
            String token,
            Long id,
            AjusteRequestDTO request
    ) {

        return restClient.post()
                .uri("/api/inventario/{id}/ajuste", id)
                .header("Authorization", token)
                .body(request)
                .retrieve()
                .body(InventarioDTO.class);
    }

    public List<MovimientoDTO> obtenerMovimientos(
            String token,
            Long id
    ) {

        return restClient.get()
                .uri("/api/inventario/{id}/movimientos", id)
                .header("Authorization", token)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }
}