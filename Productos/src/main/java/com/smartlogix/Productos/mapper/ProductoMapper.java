package com.smartlogix.Productos.mapper;

import com.smartlogix.Productos.dto.ProductoResponseDTO;
import com.smartlogix.Productos.models.Producto;

public class ProductoMapper {

    public static ProductoResponseDTO toDTO(Producto producto) {
        return new ProductoResponseDTO(
                producto.getSku(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getCategoria(),
                producto.getPrecio(),
                producto.getImagenes()
        );
    }
}