package com.smartlogix.bff.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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
            InventarioClient inventarioClient
    ) {

        this.inventarioClient = inventarioClient;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InventarioDTO crear(
            @RequestHeader("Authorization") String token,
            @RequestBody InventarioRequestDTO request
    ) {

        return inventarioClient.crearInventario(
                token,
                request
        );
    }

    @GetMapping("/{sku}")
    public InventarioDTO obtenerPorSku(
            @PathVariable String sku
    ) {

        return inventarioClient.obtenerPorSku(sku);
    }

    @GetMapping("/bodega/{bodegaId}")
    public List<InventarioDTO> obtenerPorBodega(
            @PathVariable Long bodegaId
    ) {

        return inventarioClient.obtenerPorBodega(bodegaId);
    }

    @PostMapping("/{id}/ajuste")
    public InventarioDTO ajusteManual(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody AjusteRequestDTO request
    ) {

        return inventarioClient.ajusteManual(
                token,
                id,
                request
        );
    }

    @GetMapping("/{id}/movimientos")
    public List<MovimientoDTO> obtenerMovimientos(
            @PathVariable Long id
    ) {

        return inventarioClient.obtenerMovimientos(id);
    }
}