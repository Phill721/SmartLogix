package com.smartlogix.Productos.controller;

import com.smartlogix.Productos.dto.ProductoRequestDTO;
import com.smartlogix.Productos.dto.ProductoResponseDTO;
import com.smartlogix.Productos.service.ProductoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoControllerTest {

    @Mock
    private ProductoService service;

    @InjectMocks
    private ProductoController controller;

    @Test
    void deberiaCrearProductoYRetornarCreated() {
        ProductoRequestDTO request = new ProductoRequestDTO();
        request.setSku("PROD-100");
        request.setNombre("Camara");
        request.setDescripcion("Camara HD");
        request.setCategoria("Electronica");
        request.setPrecio(BigDecimal.valueOf(49990));
        request.setImagenes(List.of("camara.jpg"));

        ProductoResponseDTO response = new ProductoResponseDTO(
                "PROD-100",
                "Camara",
                "Camara HD",
                "Electronica",
                BigDecimal.valueOf(49990),
                List.of("camara.jpg")
        );

        when(service.crearProducto(request)).thenReturn(response);

        var result = controller.crear(request);

        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        assertEquals(response, result.getBody());
        verify(service).crearProducto(request);
    }

    @Test
    void deberiaListarProductosYRetornarOk() {
        Page<ProductoResponseDTO> page = new PageImpl<>(List.of());

        when(service.listarProductos(0, 20)).thenReturn(page);

        var result = controller.listar(0, 20);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(page, result.getBody());
        verify(service).listarProductos(0, 20);
    }

    @Test
    void deberiaObtenerProductoPorSkuYRetornarOk() {
        ProductoResponseDTO response = new ProductoResponseDTO(
                "PROD-101",
                "Teclado",
                "Teclado mecanico",
                "Perifericos",
                BigDecimal.valueOf(65990),
                List.of("teclado.jpg")
        );

        when(service.obtenerPorSku("PROD-101")).thenReturn(response);

        var result = controller.obtener("PROD-101");

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(service).obtenerPorSku("PROD-101");
    }

    @Test
    void deberiaBuscarPorNombreYRetornarOk() {
        Page<ProductoResponseDTO> page = new PageImpl<>(List.of());

        when(service.buscarPorNombre("mouse", 0, 20)).thenReturn(page);

        var result = controller.buscarPorNombre("mouse", 0, 20);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(page, result.getBody());
        verify(service).buscarPorNombre("mouse", 0, 20);
    }

    @Test
    void deberiaBuscarPorCategoriaYRetornarOk() {
        Page<ProductoResponseDTO> page = new PageImpl<>(List.of());

        when(service.buscarPorCategoria("Hardware", 0, 20)).thenReturn(page);

        var result = controller.buscarPorCategoria("Hardware", 0, 20);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(page, result.getBody());
        verify(service).buscarPorCategoria("Hardware", 0, 20);
    }

    @Test
    void deberiaBuscarPorPrecioYRetornarOk() {
        Page<ProductoResponseDTO> page = new PageImpl<>(List.of());

        when(service.buscarPorPrecio(BigDecimal.valueOf(10000), BigDecimal.valueOf(30000), 0, 20))
                .thenReturn(page);

        var result = controller.buscarPorPrecio(
                BigDecimal.valueOf(10000),
                BigDecimal.valueOf(30000),
                0,
                20);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(page, result.getBody());
        verify(service).buscarPorPrecio(BigDecimal.valueOf(10000), BigDecimal.valueOf(30000), 0, 20);
    }

    @Test
    void deberiaActualizarProductoYRetornarOk() {
        ProductoRequestDTO request = new ProductoRequestDTO();
        request.setSku("PROD-102");
        request.setNombre("Monitor");
        request.setDescripcion("Monitor 4K");
        request.setCategoria("Pantallas");
        request.setPrecio(BigDecimal.valueOf(199990));
        request.setImagenes(List.of("monitor.jpg"));

        ProductoResponseDTO response = new ProductoResponseDTO(
                "PROD-102",
                "Monitor",
                "Monitor 4K",
                "Pantallas",
                BigDecimal.valueOf(199990),
                List.of("monitor.jpg")
        );

        when(service.actualizar("PROD-102", request)).thenReturn(response);

        var result = controller.actualizar("PROD-102", request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(service).actualizar("PROD-102", request);
    }

    @Test
    void deberiaEliminarProductoYRetornarNoContent() {
        doNothing().when(service).eliminar("PROD-103");

        var result = controller.eliminar("PROD-103");

        assertEquals(HttpStatus.NO_CONTENT, result.getStatusCode());
        verify(service).eliminar("PROD-103");
    }

    @Test
    void deberiaVerificarExistenciaDeSkuYRetornarOk() {
        ProductoResponseDTO response = new ProductoResponseDTO(
                "PROD-104",
                "Producto Existente",
                "Descripcion",
                "Categoria",
                BigDecimal.valueOf(1000),
                List.of("imagen.jpg")
        );

        when(service.obtenerPorSku("PROD-104")).thenReturn(response);

        var result = controller.existeSku("PROD-104");

        assertEquals(HttpStatus.OK, result.getStatusCode());
        verify(service).obtenerPorSku("PROD-104");
    }
}
