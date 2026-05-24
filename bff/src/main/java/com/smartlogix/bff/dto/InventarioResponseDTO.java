package com.smartlogix.bff.dto;

import lombok.Data;

@Data
public class InventarioResponseDTO {

    private Long id;

    private String sku;

    private Long productoId;

    private Long bodegaId;

    private Integer stockTotal;

    private Integer stockReservado;

    private Integer umbralMinimo;

    private Integer stockDisponible;
}