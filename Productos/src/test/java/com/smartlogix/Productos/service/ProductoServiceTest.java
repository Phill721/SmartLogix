package com.smartlogix.Productos.service;

import com.smartlogix.Productos.dto.ProductoRequestDTO;
import com.smartlogix.Productos.dto.ProductoResponseDTO;
import com.smartlogix.Productos.exception.ProductoNotFoundException;
import com.smartlogix.Productos.exception.SkuDuplicadoException;
import com.smartlogix.Productos.models.Producto;
import com.smartlogix.Productos.repository.ProductoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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

    @Test
    void deberiaObtenerProductoPorSku() {

        Producto producto = new Producto();

        producto.setSku("PROD-001");
        producto.setNombre("Mouse Gamer");
        producto.setDescripcion("RGB");
        producto.setCategoria("Perifericos");
        producto.setPrecio(BigDecimal.valueOf(19990));
        producto.setImagenes(List.of("img.jpg"));

        when(repository.findBySkuIgnoreCase("PROD-001"))
                .thenReturn(Optional.of(producto));

        ProductoResponseDTO resultado = service.obtenerPorSku("PROD-001");

        assertNotNull(resultado);
        assertEquals("PROD-001", resultado.getSku());

        verify(repository).findBySkuIgnoreCase("PROD-001");
    }

    @Test
    void deberiaLanzarExcepcionCuandoSkuNoExiste() {

        when(repository.findBySkuIgnoreCase("SKU-INEXISTENTE"))
                .thenReturn(Optional.empty());

        assertThrows(
                ProductoNotFoundException.class,
                () -> service.obtenerPorSku("SKU-INEXISTENTE"));
    }

    @Test
    void obtenerPorSkuDebeTenerCacheable() throws Exception {

        var metodo = ProductoService.class
                .getMethod("obtenerPorSku", String.class);

        assertTrue(
                metodo.isAnnotationPresent(
                        org.springframework.cache.annotation.Cacheable.class));
    }

    @Test
    void deberiaRetornarInformacionCompletaDelProducto() {

        Producto producto = new Producto();

        producto.setSku("PROD-001");
        producto.setNombre("Mouse Gamer");
        producto.setDescripcion("RGB");
        producto.setCategoria("Perifericos");
        producto.setPrecio(BigDecimal.valueOf(19990));
        producto.setImagenes(List.of("img.jpg"));

        when(repository.findBySkuIgnoreCase("PROD-001"))
                .thenReturn(Optional.of(producto));

        ProductoResponseDTO dto = service.obtenerPorSku("PROD-001");

        assertEquals("Mouse Gamer", dto.getNombre());
        assertEquals("RGB", dto.getDescripcion());
        assertEquals("Perifericos", dto.getCategoria());
    }

    @Test
    void deberiaBuscarSkuSinImportarMayusculas() {

            Producto producto = new Producto();

            producto.setSku("PROD-001");
            producto.setNombre("Mouse");

            when(repository.findBySkuIgnoreCase("prod-001"))
                            .thenReturn(Optional.of(producto));

            ProductoResponseDTO resultado = service.obtenerPorSku("prod-001");

            assertEquals("PROD-001", resultado.getSku());

            verify(repository)
                            .findBySkuIgnoreCase("prod-001");
    }

    @Test
    void actualizarDebeInvalidarCache() throws Exception {

            var metodo = ProductoService.class.getMethod(
                            "actualizar",
                            String.class,
                            ProductoRequestDTO.class);

            assertTrue(
                            metodo.isAnnotationPresent(
                                            org.springframework.cache.annotation.CacheEvict.class));
    }

    @Test
    void deberiaLanzarExcepcionSiNuevoSkuYaExiste() {

            Producto existente = new Producto();
            existente.setSku("PROD-001");

            ProductoRequestDTO dto = new ProductoRequestDTO();
            dto.setSku("PROD-002");

            when(repository.findBySkuIgnoreCase("PROD-001"))
                            .thenReturn(Optional.of(existente));

            when(repository.existsBySkuIgnoreCase("PROD-002"))
                            .thenReturn(true);

            assertThrows(
                            SkuDuplicadoException.class,
                            () -> service.actualizar("PROD-001", dto));
    }

    @Test
    void deberiaGuardarCambiosEnRepository() {

            Producto producto = new Producto();

            producto.setSku("PROD-001");
            producto.setNombre("Producto Viejo");

            ProductoRequestDTO dto = new ProductoRequestDTO();

            dto.setSku("PROD-001");
            dto.setNombre("Producto Nuevo");
            dto.setDescripcion("Descripcion");
            dto.setCategoria("Categoria");
            dto.setPrecio(BigDecimal.valueOf(1000));
            dto.setImagenes(List.of());

            when(repository.findBySkuIgnoreCase("PROD-001"))
                            .thenReturn(Optional.of(producto));

            when(repository.save(any(Producto.class)))
                            .thenAnswer(invocation -> invocation.getArgument(0));

            service.actualizar("PROD-001", dto);

            verify(repository).save(any(Producto.class));
    }

    @Test
    void deberiaActualizarDatosDelProducto() {

            Producto producto = new Producto();

            producto.setSku("PROD-001");
            producto.setNombre("Viejo");

            ProductoRequestDTO dto = new ProductoRequestDTO();

            dto.setSku("PROD-001");
            dto.setNombre("Nuevo");
            dto.setDescripcion("Nueva descripcion");
            dto.setCategoria("Hardware");
            dto.setPrecio(BigDecimal.valueOf(25000));
            dto.setImagenes(List.of("img.jpg"));

            when(repository.findBySkuIgnoreCase("PROD-001"))
                            .thenReturn(Optional.of(producto));

            when(repository.save(any(Producto.class)))
                            .thenAnswer(invocation -> invocation.getArgument(0));

            ProductoResponseDTO resultado = service.actualizar("PROD-001", dto);

            assertEquals("Nuevo", resultado.getNombre());
            assertEquals("Nueva descripcion", resultado.getDescripcion());
            assertEquals("Hardware", resultado.getCategoria());
    }

    @Test
    void deberiaLanzarExcepcionSiProductoNoExiste() {

            ProductoRequestDTO dto = new ProductoRequestDTO();

            when(repository.findBySkuIgnoreCase("PROD-999"))
                            .thenReturn(Optional.empty());

            assertThrows(
                            ProductoNotFoundException.class,
                            () -> service.actualizar("PROD-999", dto));
    }

    @Test
    void deberiaBuscarProductosPorCategoria() {

            Producto producto = new Producto();

            producto.setSku("PROD-001");
            producto.setCategoria("Hardware");

            Page<Producto> pagina = new PageImpl<>(List.of(producto));

            when(repository.findByCategoriaIgnoreCase(
                            eq("Hardware"),
                            any(Pageable.class))).thenReturn(pagina);

            Page<ProductoResponseDTO> resultado = service.buscarPorCategoria(
                            "Hardware",
                            0,
                            20);

            assertEquals(1, resultado.getTotalElements());

            verify(repository)
                            .findByCategoriaIgnoreCase(
                                            eq("Hardware"),
                                            any(Pageable.class));
    }

    @Test
    void deberiaRespetarParametrosDePaginacion() {

            Page<Producto> pagina = new PageImpl<>(List.of());

            ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);

            when(repository.findByCategoriaIgnoreCase(
                            eq("Hardware"),
                            any(Pageable.class))).thenReturn(pagina);

            service.buscarPorCategoria(
                            "Hardware",
                            2,
                            15);

            verify(repository)
                            .findByCategoriaIgnoreCase(
                                            eq("Hardware"),
                                            captor.capture());

            Pageable pageable = captor.getValue();

            assertEquals(2, pageable.getPageNumber());
            assertEquals(15, pageable.getPageSize());
    }

    @Test
    void deberiaCrearProductoConSkuUnico() {

            ProductoRequestDTO dto = new ProductoRequestDTO();
            dto.setSku("PROD-010");
            dto.setNombre("Audifonos");
            dto.setDescripcion("Audifonos bluetooth");
            dto.setCategoria("Audio");
            dto.setPrecio(BigDecimal.valueOf(29990));
            dto.setImagenes(List.of("img1.jpg"));

            when(repository.existsBySkuIgnoreCase("PROD-010"))
                    .thenReturn(false);

            when(repository.save(any(Producto.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            ProductoResponseDTO resultado = service.crearProducto(dto);

            assertEquals("PROD-010", resultado.getSku());
            assertEquals("Audifonos", resultado.getNombre());
            assertEquals("Audio", resultado.getCategoria());

            verify(repository).existsBySkuIgnoreCase("PROD-010");
            verify(repository).save(any(Producto.class));
    }

    @Test
    void deberiaLanzarExcepcionAlCrearConSkuDuplicado() {

            ProductoRequestDTO dto = new ProductoRequestDTO();
            dto.setSku("PROD-010");

            when(repository.existsBySkuIgnoreCase("PROD-010"))
                    .thenReturn(true);

            assertThrows(
                    SkuDuplicadoException.class,
                    () -> service.crearProducto(dto));

            verify(repository, never()).save(any(Producto.class));
    }

    @Test
    void deberiaEliminarProductoExistente() {

            Producto producto = new Producto();
            producto.setSku("PROD-011");

            when(repository.findBySkuIgnoreCase("PROD-011"))
                    .thenReturn(Optional.of(producto));

            assertDoesNotThrow(() -> service.eliminar("PROD-011"));

            verify(repository).delete(producto);
    }

    @Test
    void deberiaLanzarExcepcionAlEliminarSkuInexistente() {

            when(repository.findBySkuIgnoreCase("PROD-999"))
                    .thenReturn(Optional.empty());

            assertThrows(
                    ProductoNotFoundException.class,
                    () -> service.eliminar("PROD-999"));

            verify(repository, never()).delete(any(Producto.class));
    }

    @Test
    void deberiaBuscarProductosPorNombre() {

            Producto producto = new Producto();
            producto.setSku("PROD-005");
            producto.setNombre("Mouse Gamer");

            Page<Producto> pagina = new PageImpl<>(List.of(producto));

            when(repository.findByNombreContainingIgnoreCase(
                            eq("mouse"),
                            any(Pageable.class))).thenReturn(pagina);

            Page<ProductoResponseDTO> resultado = service.buscarPorNombre(
                            "mouse",
                            0,
                            20);

            assertEquals(1, resultado.getTotalElements());
            assertEquals("PROD-005", resultado.getContent().get(0).getSku());

            verify(repository).findByNombreContainingIgnoreCase(
                            eq("mouse"),
                            any(Pageable.class));
    }

    @Test
    void deberiaBuscarProductosPorPrecio() {

            Producto producto = new Producto();
            producto.setSku("PROD-007");
            producto.setPrecio(BigDecimal.valueOf(15000));

            Page<Producto> pagina = new PageImpl<>(List.of(producto));

            when(repository.findByPrecioBetween(
                            eq(BigDecimal.valueOf(10000)),
                            eq(BigDecimal.valueOf(20000)),
                            any(Pageable.class))).thenReturn(pagina);

            Page<ProductoResponseDTO> resultado = service.buscarPorPrecio(
                            BigDecimal.valueOf(10000),
                            BigDecimal.valueOf(20000),
                            0,
                            20);

            assertEquals(1, resultado.getTotalElements());
            assertEquals(BigDecimal.valueOf(15000), resultado.getContent().get(0).getPrecio());

            verify(repository).findByPrecioBetween(
                            eq(BigDecimal.valueOf(10000)),
                            eq(BigDecimal.valueOf(20000)),
                            any(Pageable.class));
    }

    @Test
    void deberiaActualizarSkuCuandoNoExisteDuplicado() {

            Producto producto = new Producto();
            producto.setSku("PROD-001");
            producto.setNombre("Viejo");

            ProductoRequestDTO dto = new ProductoRequestDTO();
            dto.setSku("PROD-002");
            dto.setNombre("Nuevo");
            dto.setDescripcion("Descripcion");
            dto.setCategoria("Hardware");
            dto.setPrecio(BigDecimal.valueOf(25000));
            dto.setImagenes(List.of("img.jpg"));

            when(repository.findBySkuIgnoreCase("PROD-001"))
                            .thenReturn(Optional.of(producto));
            when(repository.existsBySkuIgnoreCase("PROD-002"))
                            .thenReturn(false);
            when(repository.save(any(Producto.class)))
                            .thenAnswer(invocation -> invocation.getArgument(0));

            ProductoResponseDTO resultado = service.actualizar("PROD-001", dto);

            assertEquals("PROD-002", resultado.getSku());
            assertEquals("Nuevo", resultado.getNombre());
            verify(repository).save(any(Producto.class));
    }

    @Test
    void crearProductoDebeInvalidarCache() throws Exception {

            var metodo = ProductoService.class.getMethod(
                            "crearProducto",
                            ProductoRequestDTO.class);

            assertTrue(
                            metodo.isAnnotationPresent(
                                            org.springframework.cache.annotation.CacheEvict.class));
    }

    @Test
    void eliminarDebeInvalidarCache() throws Exception {

            var metodo = ProductoService.class.getMethod(
                            "eliminar",
                            String.class);

            assertTrue(
                            metodo.isAnnotationPresent(
                                            org.springframework.cache.annotation.CacheEvict.class));
    }
}
