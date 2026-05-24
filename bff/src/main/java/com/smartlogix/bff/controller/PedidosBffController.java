package com.smartlogix.bff.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.smartlogix.bff.client.PedidosClient;
import com.smartlogix.bff.dto.AgregarAlCarritoRequestDTO;
import com.smartlogix.bff.dto.CarritoResponseDTO;
import com.smartlogix.bff.dto.CrearPedidoRequestDTO;
import com.smartlogix.bff.dto.PageResponseDTO;
import com.smartlogix.bff.dto.PedidoListaResponseDTO;
import com.smartlogix.bff.dto.PedidoResponseDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bff/pedidos")
@RequiredArgsConstructor
public class PedidosBffController {

    private final PedidosClient pedidosClient;

    @GetMapping("/carrito")
    public CarritoResponseDTO obtenerCarrito(
            @RequestHeader("Authorization") String token
    ) {

        return pedidosClient.obtenerCarrito(token);
    }

    @PostMapping("/carrito/agregar")
    public CarritoResponseDTO agregarAlCarrito(
            @RequestHeader("Authorization") String token,
            @RequestBody AgregarAlCarritoRequestDTO request
    ) {

        return pedidosClient.agregarAlCarrito(token, request);
    }

    @DeleteMapping("/carrito/items/{itemId}")
    public CarritoResponseDTO removerDelCarrito(
            @RequestHeader("Authorization") String token,
            @PathVariable Long itemId
    ) {

        return pedidosClient.removerDelCarrito(token, itemId);
    }

    @PutMapping("/carrito/items/{itemId}")
    public CarritoResponseDTO actualizarCantidad(
            @RequestHeader("Authorization") String token,
            @PathVariable Long itemId,
            @RequestParam Integer cantidad
    ) {

        return pedidosClient.actualizarCantidad(
                token,
                itemId,
                cantidad
        );
    }

    @DeleteMapping("/carrito/vaciar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void vaciarCarrito(
            @RequestHeader("Authorization") String token
    ) {

        pedidosClient.vaciarCarrito(token);
    }

    @PostMapping("/pedidos")
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoResponseDTO crearPedido(
            @RequestHeader("Authorization") String token,
            @RequestBody CrearPedidoRequestDTO request
    ) {

        return pedidosClient.crearPedido(token, request);
    }

    @PostMapping("/pedidos/{pedidoId}/confirmar")
    public PedidoResponseDTO confirmarPedido(
            @RequestHeader("Authorization") String token,
            @PathVariable Long pedidoId
    ) {

        return pedidosClient.confirmarPedido(token, pedidoId);
    }

    @PostMapping("/pedidos/{pedidoId}/cancelar")
    public PedidoResponseDTO cancelarPedido(
            @RequestHeader("Authorization") String token,
            @PathVariable Long pedidoId
    ) {

        return pedidosClient.cancelarPedido(token, pedidoId);
    }

    @GetMapping("/pedidos/{pedidoId}")
    public PedidoResponseDTO obtenerPedido(
            @RequestHeader("Authorization") String token,
            @PathVariable Long pedidoId
    ) {

        return pedidosClient.obtenerPedido(token, pedidoId);
    }

    @GetMapping("/pedidos")
    public PageResponseDTO<PedidoListaResponseDTO> listarPedidos(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) String estado
    ) {

        return pedidosClient.listarPedidos(
                token,
                page,
                size,
                estado
        );
    }
}