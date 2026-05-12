package com.smartlogix.Productos.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductoRequestDTO implements Serializable {

    @NotBlank(message = "El SKU es obligatorio")
    private String sku;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "La descripcion es obligatoria")
    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor a 0")
    private BigDecimal precio;

    @NotBlank(message = "La categoria es obligatoria")
    private String categoria;

    @NotEmpty(message = "Debe existir al menos una imagen")
    private List<String> imagenes;
}