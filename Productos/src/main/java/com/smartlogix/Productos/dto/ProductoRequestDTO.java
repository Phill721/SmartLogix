package com.smartlogix.Productos.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductoRequestDTO implements Serializable {

    private String sku;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private String categoria;
    private List<String> imagenes;
}