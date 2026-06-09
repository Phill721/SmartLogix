package com.smartlogix.pedidos.service;

import com.smartlogix.pedidos.dto.CrearPedidoRequestDTO;
import com.smartlogix.pedidos.dto.PageResponse;
import com.smartlogix.pedidos.dto.PedidoListaResponseDTO;
import com.smartlogix.pedidos.dto.PedidoResponseDTO;
import com.smartlogix.pedidos.entity.Carrito;
import com.smartlogix.pedidos.entity.CarritoItem;
import com.smartlogix.pedidos.entity.Pedido;
import com.smartlogix.pedidos.event.PedidoCanceladoEvent;
import com.smartlogix.pedidos.exception.CarritoNoEncontradoException;
import com.smartlogix.pedidos.exception.CarritoVacioException;
import com.smartlogix.pedidos.exception.CircuitBreakerAbiertoException;
import com.smartlogix.pedidos.exception.EstadoPedidoInvalidoException;
import com.smartlogix.pedidos.exception.PedidoNotFoundException;
import com.smartlogix.pedidos.kafka.PedidoKafkaProducer;
import com.smartlogix.pedidos.mapper.PedidoMapper;
import com.smartlogix.pedidos.model.EstadoPedido;
import com.smartlogix.pedidos.repository.CarritoRepository;
import com.smartlogix.pedidos.repository.PedidoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private CarritoRepository carritoRepository;

    @Mock
    private PedidoKafkaProducer kafkaProducer;

    private PedidoMapper mapper;

    private PedidoService pedidoService;

    @BeforeEach
    void setUp() {
        mapper = new PedidoMapper();
        pedidoService = new PedidoService(pedidoRepository, carritoRepository, kafkaProducer, mapper);

        lenient().when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> {
            Pedido pedido = invocation.getArgument(0);
            if (pedido.getId() == null) {
                pedido.setId(1L);
            }
            return pedido;
        });
    }

    @Test
    void crearPedido_debeGuardarPedidoYPublicarEvento() {
        Carrito carrito = buildCarrito(100L);
        when(carritoRepository.findById(1L)).thenReturn(Optional.of(carrito));

        PedidoResponseDTO response = pedidoService.crearPedido(100L, CrearPedidoRequestDTO.builder().carritoId(1L).build());

        assertNotNull(response);
        assertEquals(100L, response.getUsuarioId());
        assertEquals("PENDIENTE", response.getEstado());
        assertEquals(new BigDecimal("20.00"), response.getTotal());
        assertEquals(1, response.getHistorial().size());
        verify(kafkaProducer, times(1)).publicarPedidoCreado(any());
        verify(pedidoRepository, times(2)).save(any(Pedido.class));
    }

    @Test
    void crearPedido_carritoNoEncontrado_lanzaExcepcion() {
        when(carritoRepository.findById(100L)).thenReturn(Optional.empty());

        assertThrows(CarritoNoEncontradoException.class,
                () -> pedidoService.crearPedido(100L, CrearPedidoRequestDTO.builder().carritoId(100L).build()));

        verify(pedidoRepository, never()).save(any(Pedido.class));
    }

    @Test
    void crearPedido_carritoDeOtroUsuario_lanzaIllegalArgumentException() {
        Carrito carrito = buildCarrito(200L);
        when(carritoRepository.findById(1L)).thenReturn(Optional.of(carrito));

        assertThrows(IllegalArgumentException.class,
                () -> pedidoService.crearPedido(100L, CrearPedidoRequestDTO.builder().carritoId(1L).build()));
    }

    @Test
    void crearPedido_carritoVacio_lanzaCarritoVacioException() {
        Carrito carrito = Carrito.builder().id(1L).usuarioId(100L).fechaCreacion(LocalDateTime.now()).build();
        when(carritoRepository.findById(1L)).thenReturn(Optional.of(carrito));

        assertThrows(CarritoVacioException.class,
                () -> pedidoService.crearPedido(100L, CrearPedidoRequestDTO.builder().carritoId(1L).build()));
    }

    @Test
    void confirmarPedido_cambiaEstadoAConfirmado() {
        Pedido pedido = buildPedido(100L, EstadoPedido.PENDIENTE);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        PedidoResponseDTO response = pedidoService.confirmarPedido(1L, 100L);

        assertNotNull(response);
        assertEquals("CONFIRMADO", response.getEstado());
        assertEquals(1, response.getHistorial().size());
        verify(pedidoRepository, atLeastOnce()).save(any(Pedido.class));
    }

    @Test
    void confirmarPedido_pedidoNoExiste_lanzaPedidoNotFoundException() {
        when(pedidoRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(PedidoNotFoundException.class, () -> pedidoService.confirmarPedido(1L, 100L));
    }

    @Test
    void confirmarPedido_estadoIncorrecto_lanzaEstadoPedidoInvalidoException() {
        Pedido pedido = buildPedido(100L, EstadoPedido.CONFIRMADO);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThrows(EstadoPedidoInvalidoException.class, () -> pedidoService.confirmarPedido(1L, 100L));
    }

    @Test
    void confirmarPedidoFallback_lanzaCircuitBreakerAbiertoException() {
        Exception ex = new RuntimeException("Error gRPC");

        assertThrows(CircuitBreakerAbiertoException.class, () -> pedidoService.confirmarPedidoFallback(1L, 100L, ex));
    }

    @Test
    void cancelarPedido_debeCancelarYLimpiarCarrito() {
        Pedido pedido = buildPedido(100L, EstadoPedido.PENDIENTE);
        pedido.setCarritoId(1L);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        Carrito carrito = buildCarrito(100L);
        when(carritoRepository.findById(1L)).thenReturn(Optional.of(carrito));

        PedidoResponseDTO response = pedidoService.cancelarPedido(1L, 100L);

        assertNotNull(response);
        assertEquals("CANCELADO", response.getEstado());
        assertEquals(new BigDecimal("0"), carrito.getTotal());
        verify(kafkaProducer, times(1)).publicarPedidoCancelado(any(PedidoCanceladoEvent.class));
        verify(carritoRepository, times(1)).save(carrito);
    }

    @Test
    void cancelarPedido_estadoNoCancelable_lanzaEstadoPedidoInvalidoException() {
        Pedido pedido = buildPedido(100L, EstadoPedido.ENTREGADO);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThrows(EstadoPedidoInvalidoException.class, () -> pedidoService.cancelarPedido(1L, 100L));
    }

    @Test
    void obtenerPedido_retornaPedidoCuandoPerteneceAlUsuario() {
        Pedido pedido = buildPedido(100L, EstadoPedido.PENDIENTE);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        PedidoResponseDTO response = pedidoService.obtenerPedido(1L, 100L);

        assertNotNull(response);
        assertEquals(100L, response.getUsuarioId());
        assertEquals("PENDIENTE", response.getEstado());
    }

    @Test
    void listarPedidosPorUsuario_retornaPageResponse() {
        Pedido pedido = buildPedido(100L, EstadoPedido.PENDIENTE);
        Page<Pedido> page = new PageImpl<>(Collections.singletonList(pedido), PageRequest.of(0, 20), 1);
        when(pedidoRepository.findByUsuarioIdOrderByFechaCreacionDesc(eq(100L), any(Pageable.class))).thenReturn(page);

        PageResponse<PedidoListaResponseDTO> response = pedidoService.listarPedidosPorUsuario(100L, 0, 20);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals(0, response.getPage());
        assertTrue(response.isLast());
    }

    @Test
    void listarTodos_retornaPageResponse() {
        Pedido pedido = buildPedido(100L, EstadoPedido.PENDIENTE);
        Page<Pedido> page = new PageImpl<>(Collections.singletonList(pedido), PageRequest.of(0, 20), 1);
        when(pedidoRepository.findAllByOrderByFechaCreacionDesc(any(Pageable.class))).thenReturn(page);

        PageResponse<PedidoListaResponseDTO> response = pedidoService.listarTodos(0, 20);

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals(1, response.getTotalPages());
    }

    private Carrito buildCarrito(Long usuarioId) {
        Carrito carrito = Carrito.builder()
                .id(1L)
                .usuarioId(usuarioId)
                .fechaCreacion(LocalDateTime.now())
                .build();

        CarritoItem item = CarritoItem.builder()
                .id(10L)
                .sku("PROD-1")
                .nombreProducto("Producto 1")
                .cantidad(2)
                .precioUnitario(new BigDecimal("10.00"))
                .build();
        item.calcularSubtotal();
        carrito.agregarItem(item);
        return carrito;
    }

    private Pedido buildPedido(Long usuarioId, EstadoPedido estado) {
        Carrito carrito = buildCarrito(usuarioId);
        Pedido pedido = mapper.toPedido(carrito);
        pedido.setId(1L);
        pedido.setUsuarioId(usuarioId);
        pedido.setCarritoId(carrito.getId());
        pedido.setEstado(estado);
        pedido.setFechaCreacion(LocalDateTime.now());
        if (estado != EstadoPedido.PENDIENTE) {
            pedido.registrarCambioEstado(estado, "Estado inicial");
        }
        return pedido;
    }
}
