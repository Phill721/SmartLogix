package com.smartlogix.pedidos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgregarAlCarritoRequestDTO {
    @NotBlank(message = "El SKU no puede estar vacío")
    private String sku;

    @NotBlank(message = "El nombre del producto no puede estar vacío")
    private String nombreProducto;

    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;

    private BigDecimal precioUnitario;
}
