package com.smartlogix.Productos.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductoRequestDTO {

    private String sku;
    private String nombre;
    private String descripcion;
    private String categoria;
}