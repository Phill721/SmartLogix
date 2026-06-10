package com.Microservicio.Pedidos.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.Microservicio.Pedidos.dto.ActualizarEstadoRequest;
import com.Microservicio.Pedidos.dto.CancelarPedidoRequest;
import com.Microservicio.Pedidos.dto.CrearPedidoRequest;
import com.Microservicio.Pedidos.dto.PedidoItemRequest;
import com.Microservicio.Pedidos.dto.PedidoResponse;
import com.Microservicio.Pedidos.exception.AccesoDenegadoException;
import com.Microservicio.Pedidos.exception.EstadoInvalidoException;
import com.Microservicio.Pedidos.exception.RecursoNoEncontradoException;
import com.Microservicio.Pedidos.exception.StockInsuficienteException;
import com.Microservicio.Pedidos.model.EstadoPedido;
import com.Microservicio.Pedidos.model.HistorialEstado;
import com.Microservicio.Pedidos.model.Pedido;
import com.Microservicio.Pedidos.model.PedidoItem;
import com.Microservicio.Pedidos.repository.PedidoRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

@ExtendWith(MockitoExtension.class)
class PedidoServiceImplTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    @InjectMocks
    private PedidoServiceImpl pedidoService;

    @Test
    void UT_BE_ORD_01_01_creaPedidoEnEstadoPendiente() {
        CrearPedidoRequest request = CrearPedidoRequest.builder()
                .usuarioId(10L)
                .total(120.0)
                .items(List.of(PedidoItemRequest.builder().sku("SKU1").cantidad(2).stockDisponible(10).build()))
                .build();

        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> {
            Pedido p = invocation.getArgument(0);
            p.setId(1L);
            return p;
        });

        PedidoResponse response = pedidoService.crearPedido(request);

        assertEquals(1L, response.getId());
        assertEquals(EstadoPedido.PENDIENTE, response.getEstado());
        assertEquals(1, response.getHistorialEstados().size());
    }

    @Test
    void UT_BE_ORD_01_02_retorna422SiStockInsuficiente() {
        CrearPedidoRequest request = CrearPedidoRequest.builder()
                .usuarioId(10L)
                .total(120.0)
                .items(List.of(PedidoItemRequest.builder().sku("SKU1").cantidad(11).stockDisponible(10).build()))
                .build();

        assertThrows(StockInsuficienteException.class, () -> pedidoService.crearPedido(request));
    }

    @Test
    void crearPedido_lanzaErrorSiNoTieneItems() {
        CrearPedidoRequest request = CrearPedidoRequest.builder()
                .usuarioId(10L)
                .total(120.0)
                .items(List.of())
                .build();

        assertThrows(IllegalArgumentException.class, () -> pedidoService.crearPedido(request));
    }

    @Test
    void crearPedido_lanzaErrorSiCantidadOStockEsNulo() {
        CrearPedidoRequest request = CrearPedidoRequest.builder()
                .usuarioId(10L)
                .total(120.0)
                .items(List.of(PedidoItemRequest.builder().sku("SKU1").cantidad(null).stockDisponible(10).build()))
                .build();

        assertThrows(IllegalArgumentException.class, () -> pedidoService.crearPedido(request));
    }

    @Test
    void UT_BE_ORD_02_01_listaSoloPedidosDeUsuarioAutenticado() {
        when(pedidoRepository.findByUsuarioId(10L)).thenReturn(List.of(buildPedido(1L, 10L, EstadoPedido.PENDIENTE)));

        List<PedidoResponse> result = pedidoService.listarPedidos(10L, false);

        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).getUsuarioId());
    }

    @Test
    void UT_BE_ORD_02_02_adminListaTodosLosPedidos() {
        when(pedidoRepository.findAll()).thenReturn(List.of(
                buildPedido(1L, 10L, EstadoPedido.PENDIENTE),
                buildPedido(2L, 20L, EstadoPedido.CONFIRMADO)
        ));

        List<PedidoResponse> result = pedidoService.listarPedidos(10L, true);

        assertEquals(2, result.size());
    }

    @Test
    void UT_BE_ORD_03_01_obtieneDetalleConHistorial() {
        Pedido pedido = buildPedido(3L, 10L, EstadoPedido.CONFIRMADO);
        pedido.setHistorialEstados(List.of(
                HistorialEstado.builder().estado(EstadoPedido.PENDIENTE).fecha(LocalDateTime.now().minusDays(1)).usuario("u1").build(),
                HistorialEstado.builder().estado(EstadoPedido.CONFIRMADO).fecha(LocalDateTime.now()).usuario("u1").build()
        ));

        when(pedidoRepository.findById(3L)).thenReturn(Optional.of(pedido));

        PedidoResponse response = pedidoService.obtenerPedido(3L, 10L, false);

        assertEquals(2, response.getHistorialEstados().size());
        assertEquals(EstadoPedido.CONFIRMADO, response.getEstado());
    }

    @Test
    void UT_BE_ORD_03_02_retorna403SiPedidoNoPerteneceAlUsuario() {
        when(pedidoRepository.findById(4L)).thenReturn(Optional.of(buildPedido(4L, 99L, EstadoPedido.PENDIENTE)));

        assertThrows(AccesoDenegadoException.class, () -> pedidoService.obtenerPedido(4L, 10L, false));
    }

    @Test
    void UT_BE_ORD_04_01_cancelaPedidoYPublicaEventoKafka() {
        Pedido pedido = buildPedido(5L, 10L, EstadoPedido.CONFIRMADO);
        when(pedidoRepository.findById(5L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PedidoResponse response = pedidoService.cancelarPedido(
                5L,
                10L,
                false,
                CancelarPedidoRequest.builder().motivo("Desisto").canceladoPor("user10").build()
        );

        assertEquals(EstadoPedido.CANCELADO, response.getEstado());
        assertTrue(response.getHistorialEstados().stream().anyMatch(h -> h.getEstado() == EstadoPedido.CANCELADO));
        verify(kafkaTemplate).send(any(String.class), any(String.class));
    }

    @Test
    void UT_BE_ORD_04_02_retorna409SiEstadoNoPermiteCancelacion() {
        when(pedidoRepository.findById(6L)).thenReturn(Optional.of(buildPedido(6L, 10L, EstadoPedido.ENTREGADO)));

        assertThrows(EstadoInvalidoException.class,
                () -> pedidoService.cancelarPedido(6L, 10L, false, CancelarPedidoRequest.builder().build()));
    }

    @Test
    void cancelarPedido_conRequestNuloUsaUsuarioSystem() {
        Pedido pedido = buildPedido(61L, 10L, EstadoPedido.PENDIENTE);
        when(pedidoRepository.findById(61L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PedidoResponse response = pedidoService.cancelarPedido(61L, 10L, false, null);

        assertEquals(EstadoPedido.CANCELADO, response.getEstado());
        assertTrue(response.getHistorialEstados().stream().anyMatch(h -> "system".equals(h.getUsuario())));
    }

    @Test
    void UT_BE_ORD_05_01_actualizaEstadoYRegistraHistorial() {
        Pedido pedido = buildPedido(7L, 10L, EstadoPedido.CONFIRMADO);
        when(pedidoRepository.findById(7L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PedidoResponse response = pedidoService.actualizarEstado(
                7L,
                ActualizarEstadoRequest.builder().nuevoEstado(EstadoPedido.ENVIADO).actualizadoPor("admin").build()
        );

        assertEquals(EstadoPedido.ENVIADO, response.getEstado());
        assertTrue(response.getHistorialEstados().stream().anyMatch(h -> h.getEstado() == EstadoPedido.ENVIADO));
    }

    @Test
    void UT_BE_ORD_05_02_retorna422SiTransicionNoEsValida() {
        Pedido pedido = buildPedido(8L, 10L, EstadoPedido.ENTREGADO);
        when(pedidoRepository.findById(8L)).thenReturn(Optional.of(pedido));

        assertThrows(EstadoInvalidoException.class,
                () -> pedidoService.actualizarEstado(
                        8L,
                        ActualizarEstadoRequest.builder().nuevoEstado(EstadoPedido.PENDIENTE).actualizadoPor("admin").build()
                ));
    }

    @Test
    void actualizarEstado_lanzaErrorSiRequestEsNulo() {
        Pedido pedido = buildPedido(81L, 10L, EstadoPedido.CONFIRMADO);
        when(pedidoRepository.findById(81L)).thenReturn(Optional.of(pedido));

        assertThrows(IllegalArgumentException.class, () -> pedidoService.actualizarEstado(81L, null));
    }

    @Test
    void actualizarEstado_lanzaErrorSiNuevoEstadoEsNulo() {
        Pedido pedido = buildPedido(82L, 10L, EstadoPedido.CONFIRMADO);
        when(pedidoRepository.findById(82L)).thenReturn(Optional.of(pedido));

        assertThrows(IllegalArgumentException.class,
                () -> pedidoService.actualizarEstado(82L, ActualizarEstadoRequest.builder().actualizadoPor("admin").build()));
    }

    @Test
    void obtenerPedido_lanzaNotFoundCuandoNoExiste() {
        when(pedidoRepository.findById(100L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> pedidoService.obtenerPedido(100L, 10L, true));
    }

    private Pedido buildPedido(Long id, Long usuarioId, EstadoPedido estado) {
        return Pedido.builder()
                .id(id)
                .usuarioId(usuarioId)
                .estado(estado)
                .total(100.0)
                .fechaCreacion(LocalDateTime.now())
                .items(List.of(PedidoItem.builder().sku("SKU1").cantidad(1).stockDisponible(10).build()))
                .historialEstados(new java.util.ArrayList<>(List.of(
                        HistorialEstado.builder().estado(estado).fecha(LocalDateTime.now()).usuario("system").build()
                )))
                .build();
    }
}
