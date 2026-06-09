package com.smartlogix.pedidos.service;

import com.smartlogix.pedidos.dto.AgregarAlCarritoRequestDTO;
import com.smartlogix.pedidos.dto.CarritoResponseDTO;
import com.smartlogix.pedidos.entity.Carrito;
import com.smartlogix.pedidos.entity.CarritoItem;
import com.smartlogix.pedidos.exception.CarritoVacioException;
import com.smartlogix.pedidos.integration.ProductoCatalogoClient;
import com.smartlogix.pedidos.mapper.PedidoMapper;
import com.smartlogix.pedidos.repository.CarritoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CarritoServiceTest {

    @Mock
    private CarritoRepository carritoRepository;

    @Mock
    private ProductoCatalogoClient productoCatalogoClient;

    private PedidoMapper mapper;

    private CarritoService carritoService;

    @BeforeEach
    void setUp() {
        mapper = new PedidoMapper();
        carritoService = new CarritoService(carritoRepository, mapper, productoCatalogoClient);
        when(carritoRepository.save(any(Carrito.class))).thenAnswer(invocation -> {
            Carrito carrito = invocation.getArgument(0);
            if (carrito.getId() == null) {
                carrito.setId(1L);
            }
            return carrito;
        });
    }

    @Test
    void obtenerCarritoPorUsuario_creaNuevoCarritoCuandoNoExiste() {
        when(carritoRepository.findByUsuarioId(100L)).thenReturn(Optional.empty());

        CarritoResponseDTO response = carritoService.obtenerCarritoPorUsuario(100L);

        assertNotNull(response);
        assertEquals(100L, response.getUsuarioId());
        assertNotNull(response.getFechaCreacion());
        verify(carritoRepository, times(1)).save(any(Carrito.class));
    }

    @Test
    void agregarAlCarrito_agregaNuevoItemYActualizaTotal() {
        doNothing().when(productoCatalogoClient).validarSkuExistente("PROD-1");
        when(carritoRepository.findByUsuarioId(100L)).thenReturn(Optional.empty());

        AgregarAlCarritoRequestDTO request = AgregarAlCarritoRequestDTO.builder()
                .sku("PROD-1")
                .nombreProducto("Producto 1")
                .cantidad(3)
                .precioUnitario(new BigDecimal("5.00"))
                .build();

        CarritoResponseDTO response = carritoService.agregarAlCarrito(100L, request);

        assertNotNull(response);
        assertEquals(new BigDecimal("15.00"), response.getTotal());
        assertEquals(1, response.getItems().size());
    }

    @Test
    void agregarAlCarrito_aumentaCantidadSiProductoExiste() {
        Carrito carrito = Carrito.builder().id(1L).usuarioId(100L).fechaCreacion(LocalDateTime.now()).build();
        CarritoItem existingItem = CarritoItem.builder()
                .id(10L)
                .carrito(carrito)
                .sku("PROD-1")
                .nombreProducto("Producto 1")
                .cantidad(1)
                .precioUnitario(new BigDecimal("5.00"))
                .build();
        existingItem.calcularSubtotal();
        carrito.agregarItem(existingItem);

        doNothing().when(productoCatalogoClient).validarSkuExistente("PROD-1");
        when(carritoRepository.findByUsuarioId(100L)).thenReturn(Optional.of(carrito));

        AgregarAlCarritoRequestDTO request = AgregarAlCarritoRequestDTO.builder()
                .sku("PROD-1")
                .nombreProducto("Producto 1")
                .cantidad(2)
                .precioUnitario(new BigDecimal("5.00"))
                .build();

        CarritoResponseDTO response = carritoService.agregarAlCarrito(100L, request);

        assertNotNull(response);
        assertEquals(new BigDecimal("15.00"), response.getTotal());
        assertEquals(1, response.getItems().size());
        assertEquals(3, response.getItems().get(0).getCantidad());
    }

    @Test
    void removerDelCarrito_eliminaElItemDelCarrito() {
        Carrito carrito = Carrito.builder().id(1L).usuarioId(100L).fechaCreacion(LocalDateTime.now()).build();
        CarritoItem item = CarritoItem.builder()
                .id(10L)
                .carrito(carrito)
                .sku("PROD-1")
                .nombreProducto("Producto 1")
                .cantidad(1)
                .precioUnitario(new BigDecimal("5.00"))
                .build();
        item.calcularSubtotal();
        carrito.agregarItem(item);

        when(carritoRepository.findByUsuarioId(100L)).thenReturn(Optional.of(carrito));

        CarritoResponseDTO response = carritoService.removerDelCarrito(100L, 10L);

        assertNotNull(response);
        assertEquals(0, response.getItems().size());
        assertEquals(new BigDecimal("0"), response.getTotal());
    }

    @Test
    void vaciarCarrito_eliminaTodosLosItems() {
        Carrito carrito = buildCarrito(100L);
        when(carritoRepository.findByUsuarioId(100L)).thenReturn(Optional.of(carrito));

        carritoService.vaciarCarrito(100L);

        assertEquals(0, carrito.getItems().size());
        assertEquals(new BigDecimal("0"), carrito.getTotal());
        verify(carritoRepository, times(1)).save(carrito);
    }

    @Test
    void actualizarCantidadItem_aCero_remueveItem() {
        Carrito carrito = buildCarrito(100L);
        CarritoItem item = carrito.getItems().get(0);

        when(carritoRepository.findByUsuarioId(100L)).thenReturn(Optional.of(carrito));

        CarritoResponseDTO response = carritoService.actualizarCantidadItem(100L, item.getId(), 0);

        assertNotNull(response);
        assertEquals(0, response.getItems().size());
    }

    @Test
    void actualizarCantidadItem_actualizaCantidadYTotal() {
        Carrito carrito = buildCarrito(100L);
        CarritoItem item = carrito.getItems().get(0);

        when(carritoRepository.findByUsuarioId(100L)).thenReturn(Optional.of(carrito));

        CarritoResponseDTO response = carritoService.actualizarCantidadItem(100L, item.getId(), 5);

        assertNotNull(response);
        assertEquals(5, response.getItems().get(0).getCantidad());
        assertEquals(new BigDecimal("50.00"), response.getTotal());
    }

    private Carrito buildCarrito(Long usuarioId) {
        Carrito carrito = Carrito.builder()
                .id(1L)
                .usuarioId(usuarioId)
                .fechaCreacion(LocalDateTime.now())
                .build();
        CarritoItem item = CarritoItem.builder()
                .id(10L)
                .carrito(carrito)
                .sku("PROD-1")
                .nombreProducto("Producto 1")
                .cantidad(2)
                .precioUnitario(new BigDecimal("10.00"))
                .build();
        item.calcularSubtotal();
        carrito.agregarItem(item);
        return carrito;
    }
}
