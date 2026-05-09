package com.smartlogix.Productos.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductoResponseDTO implements Serializable {

    private String sku;
    private String nombre;
    private String descripcion;
    private String categoria;
    private BigDecimal precio;
    private List<String> imagenes;
}