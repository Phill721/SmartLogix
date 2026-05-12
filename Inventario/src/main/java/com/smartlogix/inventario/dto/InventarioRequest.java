package com.smartlogix.inventario.dto;

import lombok.Data;

@Data
public class InventarioRequest {
    private String sku;
    private Long productoId;
    private Long bodegaId;
    private Integer stockInicial;
    private Integer umbralMinimo;
}