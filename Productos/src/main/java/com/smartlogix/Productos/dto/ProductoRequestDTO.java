package com.smartlogix.Productos.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductoRequestDTO {

    private String sku;
    private String nombre;
    private String descripcion;
    private String categoria;
    private List<String> imagenes;
}