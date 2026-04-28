package com.smartlogix.inventario.dto;

import lombok.Data;

@Data
public class AjusteRequest {
    private Integer cantidad;
    private String motivo;
}