package com.smartlogix.bff.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class ProductoRequestDTO {

    private String sku;

    private String nombre;

    private String descripcion;

    private BigDecimal precio;

    private String categoria;

    private List<String> imagenes;
}