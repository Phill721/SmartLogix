package com.smartlogix.inventario.dto;

import lombok.Data;

@Data
public class InventarioRequest {
    private Long productoId;
    private String sku;
    private Long bodegaId;
    private Integer stockInicial;
    private Integer umbralMinimo;
}