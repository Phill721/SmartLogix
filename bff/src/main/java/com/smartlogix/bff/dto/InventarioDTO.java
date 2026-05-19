package com.smartlogix.bff.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class InventarioDTO {

    private Long id;

    private String sku;

    private Long productoId;

    private Long bodegaId;

    private Integer stockTotal;

    private Integer stockReservado;

    private Integer umbralMinimo;

    private Integer stockDisponible;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaActualizacion;
}