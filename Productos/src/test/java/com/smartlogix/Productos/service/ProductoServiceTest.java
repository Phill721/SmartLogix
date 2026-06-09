package com.smartlogix.Productos.service;

import com.smartlogix.Productos.dto.ProductoResponseDTO;
import com.smartlogix.Productos.models.Producto;
import com.smartlogix.Productos.repository.ProductoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository repository;

    @InjectMocks
    private ProductoService service;

    @Test
    void deberiaListarProductosPaginados() {

        Producto producto = new Producto();
        producto.setSku("PROD-001");
        producto.setNombre("Mouse Gamer");
        producto.setDescripcion("Mouse RGB");
        producto.setCategoria("Perifericos");
        producto.setPrecio(BigDecimal.valueOf(19990));
        producto.setImagenes(List.of("imagen.jpg"));

        Page<Producto> paginaMock = new PageImpl<>(
                List.of(producto),
                PageRequest.of(0, 20),
                1
        );

        when(repository.findAll(any(Pageable.class)))
                .thenReturn(paginaMock);

        Page<ProductoResponseDTO> resultado =
                service.listarProductos(0, 20);

        assertEquals(1, resultado.getContent().size());

        verify(repository)
                .findAll(PageRequest.of(0, 20));
    }

    @Test
    void deberiaMapearTodosLosCamposDelProducto() {

        Producto producto = new Producto();
        producto.setSku("PROD-001");
        producto.setNombre("Teclado");
        producto.setDescripcion("Teclado mecanico");
        producto.setCategoria("Perifericos");
        producto.setPrecio(BigDecimal.valueOf(49990));
        producto.setImagenes(List.of("img1.jpg"));

        Page<Producto> paginaMock = new PageImpl<>(
                List.of(producto)
        );

        when(repository.findAll(any(Pageable.class)))
                .thenReturn(paginaMock);

        ProductoResponseDTO dto =
                service.listarProductos(0, 20)
                        .getContent()
                        .get(0);

        assertEquals("PROD-001", dto.getSku());
        assertEquals("Teclado", dto.getNombre());
        assertEquals("Teclado mecanico", dto.getDescripcion());
        assertEquals("Perifericos", dto.getCategoria());
        assertEquals(BigDecimal.valueOf(49990), dto.getPrecio());
        assertEquals(List.of("img1.jpg"), dto.getImagenes());
    }

    @Test
    void deberiaRetornarPaginaVaciaCuandoNoExistenProductos() {

        Page<Producto> paginaVacia = Page.empty();

        when(repository.findAll(any(Pageable.class)))
                .thenReturn(paginaVacia);

        Page<ProductoResponseDTO> resultado =
                service.listarProductos(0, 20);

        assertTrue(resultado.isEmpty());
    }

    @Test
    void listarProductosDebeTenerCacheable() throws Exception {

        var metodo = ProductoService.class
                .getMethod("listarProductos",
                        int.class,
                        int.class);

        assertTrue(
                metodo.isAnnotationPresent(
                        org.springframework.cache.annotation.Cacheable.class));
    }
}