package com.smartlogix.Productos.mapper;

import com.smartlogix.Productos.dto.ProductoRequestDTO;
import com.smartlogix.Productos.dto.ProductoResponseDTO;
import com.smartlogix.Productos.factory.ProductoFactory;
import com.smartlogix.Productos.models.Producto;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ProductoFactoryMapperTest {

    @Test
    void deberiaCrearProductoDesdeRequestDto() {
        ProductoRequestDTO dto = new ProductoRequestDTO();
        dto.setSku("PROD-200");
        dto.setNombre("Memoria RAM");
        dto.setDescripcion("16GB DDR4");
        dto.setPrecio(BigDecimal.valueOf(129990));
        dto.setCategoria("Componentes");
        dto.setImagenes(List.of("ram.jpg"));

        Producto producto = ProductoFactory.crearProducto(dto);

        assertEquals("PROD-200", producto.getSku());
        assertEquals("Memoria RAM", producto.getNombre());
        assertEquals("16GB DDR4", producto.getDescripcion());
        assertEquals(BigDecimal.valueOf(129990), producto.getPrecio());
        assertEquals("Componentes", producto.getCategoria());
        assertEquals(List.of("ram.jpg"), producto.getImagenes());
    }

    @Test
    void deberiaMapearProductoAResponseDto() {
        Producto producto = new Producto();
        producto.setSku("PROD-201");
        producto.setNombre("Disco SSD");
        producto.setDescripcion("512GB NVMe");
        producto.setPrecio(BigDecimal.valueOf(239990));
        producto.setCategoria("Almacenamiento");
        producto.setImagenes(List.of("ssd.jpg"));

        ProductoResponseDTO dto = ProductoMapper.toDTO(producto);

        assertEquals("PROD-201", dto.getSku());
        assertEquals("Disco SSD", dto.getNombre());
        assertEquals("512GB NVMe", dto.getDescripcion());
        assertEquals("Almacenamiento", dto.getCategoria());
        assertEquals(BigDecimal.valueOf(239990), dto.getPrecio());
        assertEquals(List.of("ssd.jpg"), dto.getImagenes());
    }
}
