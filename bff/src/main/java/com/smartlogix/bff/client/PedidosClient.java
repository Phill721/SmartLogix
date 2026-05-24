package com.smartlogix.bff.client;

import com.smartlogix.bff.dto.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class PedidosClient {

    private final RestClient restClient;

    public PedidosClient(
            @Value("${pedidos.url}") String pedidosUrl
    ) {

        this.restClient = RestClient.builder()
                .baseUrl(pedidosUrl)
                .build();
    }

    public CarritoResponseDTO obtenerCarrito(String token) {

        return restClient.get()
                .uri("/api/carrito")
                .header("Authorization", token)
                .retrieve()
                .body(CarritoResponseDTO.class);
    }

    public CarritoResponseDTO agregarAlCarrito(
            String token,
            AgregarAlCarritoRequestDTO request
    ) {

        return restClient.post()
                .uri("/api/carrito/agregar")
                .header("Authorization", token)
                .body(request)
                .retrieve()
                .body(CarritoResponseDTO.class);
    }

    public CarritoResponseDTO removerDelCarrito(
            String token,
            Long itemId
    ) {

        return restClient.delete()
                .uri("/api/carrito/items/{itemId}", itemId)
                .header("Authorization", token)
                .retrieve()
                .body(CarritoResponseDTO.class);
    }

    public CarritoResponseDTO actualizarCantidad(
            String token,
            Long itemId,
            Integer cantidad
    ) {

        return restClient.put()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/carrito/items/{itemId}")
                        .queryParam("cantidad", cantidad)
                        .build(itemId))
                .header("Authorization", token)
                .retrieve()
                .body(CarritoResponseDTO.class);
    }

    public void vaciarCarrito(String token) {

        restClient.delete()
                .uri("/api/carrito/vaciar")
                .header("Authorization", token)
                .retrieve()
                .toBodilessEntity();
    }

    public PedidoResponseDTO crearPedido(
            String token,
            CrearPedidoRequestDTO request
    ) {

        return restClient.post()
                .uri("/api/pedidos")
                .header("Authorization", token)
                .body(request)
                .retrieve()
                .body(PedidoResponseDTO.class);
    }

    public PedidoResponseDTO confirmarPedido(
            String token,
            Long pedidoId
    ) {

        return restClient.post()
                .uri("/api/pedidos/{pedidoId}/confirmar", pedidoId)
                .header("Authorization", token)
                .retrieve()
                .body(PedidoResponseDTO.class);
    }

    public PedidoResponseDTO cancelarPedido(
            String token,
            Long pedidoId
    ) {

        return restClient.post()
                .uri("/api/pedidos/{pedidoId}/cancelar", pedidoId)
                .header("Authorization", token)
                .retrieve()
                .body(PedidoResponseDTO.class);
    }

    public PedidoResponseDTO obtenerPedido(
            String token,
            Long pedidoId
    ) {

        return restClient.get()
                .uri("/api/pedidos/{pedidoId}", pedidoId)
                .header("Authorization", token)
                .retrieve()
                .body(PedidoResponseDTO.class);
    }

    public PageResponseDTO<PedidoListaResponseDTO> listarPedidos(
            String token,
            Integer page,
            Integer size,
            String estado
    ) {

        return restClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder
                            .path("/api/pedidos")
                            .queryParam("page", page)
                            .queryParam("size", size);

                    if (estado != null && !estado.isBlank()) {
                        builder.queryParam("estado", estado);
                    }

                    return builder.build();
                })
                .header("Authorization", token)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }
}