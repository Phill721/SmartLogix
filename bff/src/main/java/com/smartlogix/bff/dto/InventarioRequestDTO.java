package com.smartlogix.bff.dto;

import lombok.Data;

@Data
public class InventarioRequestDTO {

    private String sku;

    private Long productoId;

    private Long bodegaId;

    private Integer stockTotal;

    private Integer umbralMinimo;
}