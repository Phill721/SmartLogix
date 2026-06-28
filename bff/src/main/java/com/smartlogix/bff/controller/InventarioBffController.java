package com.smartlogix.bff.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import com.smartlogix.bff.client.InventarioClient;
import com.smartlogix.bff.dto.AjusteRequestDTO;
import com.smartlogix.bff.dto.InventarioDTO;
import com.smartlogix.bff.dto.InventarioRequestDTO;
import com.smartlogix.bff.dto.MovimientoDTO;

@RestController
@RequestMapping("/api/bff/inventario")
public class InventarioBffController {

    private final InventarioClient inventarioClient;

    public InventarioBffController(
            InventarioClient inventarioClient) {

        this.inventarioClient = inventarioClient;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InventarioDTO crear(
            @RequestHeader("Authorization") String token,
            @RequestBody InventarioRequestDTO request) {

        return inventarioClient.crearInventario(
                token,
                request);
    }

    @GetMapping("/{sku}")
    public InventarioDTO obtenerPorSku(
            @PathVariable String sku,
            @RequestHeader("Authorization") String token) {

        return inventarioClient.obtenerPorSku(token, sku);
    }

    @GetMapping("/bodega/{bodegaId}")
    public List<InventarioDTO> obtenerPorBodega(
            @PathVariable Long bodegaId,
            @RequestHeader("Authorization") String token) {

        return inventarioClient.obtenerPorBodega(token, bodegaId);
    }

    @PostMapping("/{id}/ajuste")
    public InventarioDTO ajusteManual(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody AjusteRequestDTO request) {

        return inventarioClient.ajusteManual(
                token,
                id,
                request);
    }

    @GetMapping("/{id}/movimientos")
    public List<MovimientoDTO> obtenerMovimientos(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {

        return inventarioClient.obtenerMovimientos(token, id);
    }

    @PutMapping("/{sku}")
    public InventarioDTO actualizarStockDesdeReact(
            @RequestHeader("Authorization") String token,
            @PathVariable String sku,
            @RequestBody AjusteRequestDTO request) {
        InventarioDTO invActual = inventarioClient.obtenerPorSku(token, sku);
        return inventarioClient.ajusteManual(
                token,
                invActual.getId(),
                request);
    }
}