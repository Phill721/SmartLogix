package com.smartlogix.Productos.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductoResponseDTO {

    private String sku;
    private String nombre;
    private String descripcion;
    private String categoria;
    private List<String> imagenes;
}