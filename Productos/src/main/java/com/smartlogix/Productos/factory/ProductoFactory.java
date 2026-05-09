package com.smartlogix.Productos.factory;

import com.smartlogix.Productos.dto.ProductoRequestDTO;
import com.smartlogix.Productos.models.Producto;

public class ProductoFactory {

    public static Producto crearProducto(ProductoRequestDTO dto) {
        Producto producto = new Producto();
        producto.setSku(dto.getSku());
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setCategoria(dto.getCategoria());
        producto.setImagenes(dto.getImagenes());
        return producto;
    }
}