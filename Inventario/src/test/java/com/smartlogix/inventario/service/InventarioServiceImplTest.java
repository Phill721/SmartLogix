package com.smartlogix.inventario.service;

import com.smartlogix.inventario.client.ProductosClient;
import com.smartlogix.inventario.dto.AjusteRequest;
import com.smartlogix.inventario.dto.InventarioRequest;
import com.smartlogix.inventario.entity.Inventario;
import com.smartlogix.inventario.entity.MovimientoInventario;
import com.smartlogix.inventario.entity.TipoMovimiento;
import com.smartlogix.inventario.exception.ProductoNoEncontradoException;
import com.smartlogix.inventario.exception.StockInsuficienteException;
import com.smartlogix.inventario.kafka.InventarioKafkaProducer;
import com.smartlogix.inventario.repository.InventarioRepository;
import com.smartlogix.inventario.repository.MovimientoInventarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.doNothing;

@ExtendWith(MockitoExtension.class)
class InventarioServiceImplTest {

    @Mock
    private InventarioRepository inventarioRepository;

    @Mock
    private MovimientoInventarioRepository movimientoRepository;

    @Mock
    private InventarioKafkaProducer kafkaProducer;

    @Mock
    private ProductosClient productosClient;

    @InjectMocks
    private InventarioServiceImpl service;

    @Captor
    private ArgumentCaptor<MovimientoInventario> movimientoCaptor;

    private Inventario inventarioExistente;

    @BeforeEach
    void setUp() {
        inventarioExistente = Inventario.builder()
                .id(1L)
                .sku("SKU-123")
                .productoId(55L)
                .bodegaId(10L)
                .stockTotal(100)
                .stockReservado(20)
                .umbralMinimo(15)
                .build();
    }

    @Test
    void crearInventario_debeGuardarInventarioYRegistrarMovimiento() {
        InventarioRequest request = new InventarioRequest();
        request.setSku("SKU-321");
        request.setProductoId(99L);
        request.setBodegaId(5L);
        request.setStockTotal(50);
        request.setUmbralMinimo(10);

        Inventario inventarioGuardado = Inventario.builder()
                .id(2L)
                .sku(request.getSku())
                .productoId(request.getProductoId())
                .bodegaId(request.getBodegaId())
                .stockTotal(request.getStockTotal())
                .stockReservado(0)
                .umbralMinimo(request.getUmbralMinimo())
                .build();

        doNothing().when(productosClient).validarSkuExiste("Bearer token", "SKU-321");
        given(inventarioRepository.save(any(Inventario.class))).willReturn(inventarioGuardado);
        given(movimientoRepository.save(any(MovimientoInventario.class)))
                .willReturn(MovimientoInventario.builder().id(1L).build());

        Inventario resultado = service.crearInventario("Bearer token", request);

        assertThat(resultado.getId()).isEqualTo(2L);
        assertThat(resultado.getStockReservado()).isZero();
        assertThat(resultado.getStockTotal()).isEqualTo(50);
        assertThat(resultado.getSku()).isEqualTo("SKU-321");

        then(productosClient).should().validarSkuExiste("Bearer token", "SKU-321");
        then(inventarioRepository).should().save(any(Inventario.class));
        then(movimientoRepository).should().save(movimientoCaptor.capture());

        MovimientoInventario movimiento = movimientoCaptor.getValue();
        assertThat(movimiento.getTipoMovimiento()).isEqualTo(TipoMovimiento.INICIAL);
        assertThat(movimiento.getCantidad()).isEqualTo(50);
        assertThat(movimiento.getMotivo()).contains("Registro inicial de stock");
    }

    @Test
    void obtenerPorSku_existente_retornaInventario() {
        given(inventarioRepository.findBySku("SKU-123")).willReturn(Optional.of(inventarioExistente));

        Inventario resultado = service.obtenerPorSku("SKU-123");

        assertThat(resultado).isEqualTo(inventarioExistente);
    }

    @Test
    void obtenerPorSku_noExiste_lanzaProductoNoEncontradoException() {
        given(inventarioRepository.findBySku("INEXISTENTE")).willReturn(Optional.empty());

        assertThatThrownBy(() -> service.obtenerPorSku("INEXISTENTE"))
                .isInstanceOf(ProductoNoEncontradoException.class)
                .hasMessageContaining("Producto no encontrado");
    }

    @Test
    void obtenerPorBodega_retornaListaDeInventarios() {
        given(inventarioRepository.findByBodegaId(10L)).willReturn(List.of(inventarioExistente));

        List<Inventario> resultado = service.obtenerPorBodega(10L);

        assertThat(resultado).hasSize(1).containsExactly(inventarioExistente);
    }

    @Test
    void ajusteManual_valido_actualizaStockTotalYRegistraMovimiento() {
        AjusteRequest request = new AjusteRequest();
        request.setCantidad(10);
        request.setMotivo("Ajuste de stock");

        given(inventarioRepository.findById(1L)).willReturn(Optional.of(inventarioExistente));
        given(inventarioRepository.save(any(Inventario.class))).willAnswer(invocation -> invocation.getArgument(0));
        given(movimientoRepository.save(any(MovimientoInventario.class)))
                .willReturn(MovimientoInventario.builder().id(2L).build());

        Inventario resultado = service.ajusteManual(1L, request);

        assertThat(resultado.getStockTotal()).isEqualTo(110);
        assertThat(resultado.getStockReservado()).isEqualTo(20);
        assertThat(resultado.getStockDisponible()).isEqualTo(90);

        then(movimientoRepository).should().save(movimientoCaptor.capture());
        assertThat(movimientoCaptor.getValue().getTipoMovimiento()).isEqualTo(TipoMovimiento.AJUSTE);
        then(kafkaProducer).should().enviarEventoActualizacion(any(Inventario.class));
    }

    @Test
    void ajusteManual_bajoUmbral_enviaAlertaStockBajo() {
        inventarioExistente.setStockTotal(20);
        inventarioExistente.setStockReservado(5);
        inventarioExistente.setUmbralMinimo(10);

        AjusteRequest request = new AjusteRequest();
        request.setCantidad(-6);
        request.setMotivo("Ajuste bajo stock");

        given(inventarioRepository.findById(1L)).willReturn(Optional.of(inventarioExistente));
        given(inventarioRepository.save(any(Inventario.class))).willAnswer(invocation -> invocation.getArgument(0));
        given(movimientoRepository.save(any(MovimientoInventario.class)))
                .willReturn(MovimientoInventario.builder().id(8L).build());

        Inventario resultado = service.ajusteManual(1L, request);

        assertThat(resultado.getStockDisponible()).isEqualTo(9);
        then(kafkaProducer).should().enviarAlertaStockBajo(any(Inventario.class));
        then(kafkaProducer).should().enviarEventoActualizacion(any(Inventario.class));
    }

    @Test
    void ajusteManual_stockInsuficiente_lanzaIllegalArgumentException() {
        inventarioExistente.setStockReservado(80);
        AjusteRequest request = new AjusteRequest();
        request.setCantidad(-50);
        request.setMotivo("Salida masiva");

        given(inventarioRepository.findById(1L)).willReturn(Optional.of(inventarioExistente));

        assertThatThrownBy(() -> service.ajusteManual(1L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("stock total no puede ser menor al stock reservado");
    }

    @Test
    void reservarStock_disponibleSuficiente_reservaYRegistraMovimiento() {
        given(inventarioRepository.findBySku("SKU-123")).willReturn(Optional.of(inventarioExistente));
        given(inventarioRepository.save(any(Inventario.class))).willAnswer(invocation -> invocation.getArgument(0));
        given(movimientoRepository.save(any(MovimientoInventario.class)))
                .willReturn(MovimientoInventario.builder().id(3L).build());

        service.reservarStock("SKU-123", 10, "PED-001");

        then(inventarioRepository).should().save(any(Inventario.class));
        then(movimientoRepository).should().save(movimientoCaptor.capture());
        assertThat(movimientoCaptor.getValue().getTipoMovimiento()).isEqualTo(TipoMovimiento.RESERVA);
        then(kafkaProducer).should().enviarEventoActualizacion(any(Inventario.class));
    }

    @Test
    void reservarStock_stockInsuficiente_lanzaStockInsuficienteException() {
        given(inventarioRepository.findBySku("SKU-123")).willReturn(Optional.of(inventarioExistente));

        assertThatThrownBy(() -> service.reservarStock("SKU-123", 1000, "PED-002"))
                .isInstanceOf(StockInsuficienteException.class)
                .hasMessageContaining("Stock insuficiente");
    }

    @Test
    void liberarStock_valido_liberaStockYRegistraMovimiento() {
        given(inventarioRepository.findBySku("SKU-123")).willReturn(Optional.of(inventarioExistente));
        given(inventarioRepository.save(any(Inventario.class))).willAnswer(invocation -> invocation.getArgument(0));
        given(movimientoRepository.save(any(MovimientoInventario.class)))
                .willReturn(MovimientoInventario.builder().id(4L).build());

        service.liberarStock("SKU-123", 10, "PED-003");

        then(inventarioRepository).should().save(any(Inventario.class));
        then(movimientoRepository).should().save(movimientoCaptor.capture());
        assertThat(movimientoCaptor.getValue().getTipoMovimiento()).isEqualTo(TipoMovimiento.LIBERACION);
        assertThat(inventarioExistente.getStockReservado()).isEqualTo(10);
    }

    @Test
    void liberarStock_masQueReservado_lanzaIllegalArgumentException() {
        given(inventarioRepository.findBySku("SKU-123")).willReturn(Optional.of(inventarioExistente));

        assertThatThrownBy(() -> service.liberarStock("SKU-123", 25, "PED-004"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("No se puede liberar más stock");
    }

    @Test
    void confirmarVenta_valido_confirmaVentaYRegistraMovimiento() {
        given(inventarioRepository.findBySku("SKU-123")).willReturn(Optional.of(inventarioExistente));
        given(inventarioRepository.save(any(Inventario.class))).willAnswer(invocation -> invocation.getArgument(0));
        given(movimientoRepository.save(any(MovimientoInventario.class)))
                .willReturn(MovimientoInventario.builder().id(5L).build());

        service.confirmarVenta("SKU-123", 10, "PED-005");

        assertThat(inventarioExistente.getStockTotal()).isEqualTo(90);
        assertThat(inventarioExistente.getStockReservado()).isEqualTo(10);
        then(movimientoRepository).should().save(movimientoCaptor.capture());
        assertThat(movimientoCaptor.getValue().getTipoMovimiento()).isEqualTo(TipoMovimiento.VENTA);
        then(kafkaProducer).should().enviarEventoActualizacion(any(Inventario.class));
    }

    @Test
    void confirmarVenta_masQueReservado_lanzaIllegalArgumentException() {
        given(inventarioRepository.findBySku("SKU-123")).willReturn(Optional.of(inventarioExistente));

        assertThatThrownBy(() -> service.confirmarVenta("SKU-123", 25, "PED-006"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("No se puede confirmar una venta");
    }

    @Test
    void actualizarStock_valido_actualizaStockYRegistraMovimiento() {
        given(inventarioRepository.findBySku("SKU-123")).willReturn(Optional.of(inventarioExistente));
        given(inventarioRepository.save(any(Inventario.class))).willAnswer(invocation -> invocation.getArgument(0));
        given(movimientoRepository.save(any(MovimientoInventario.class)))
                .willReturn(MovimientoInventario.builder().id(6L).build());

        service.actualizarStock("SKU-123", 120, "Ajuste inventario");

        assertThat(inventarioExistente.getStockTotal()).isEqualTo(120);
        then(movimientoRepository).should().save(movimientoCaptor.capture());
        assertThat(movimientoCaptor.getValue().getCantidad()).isEqualTo(20);
        assertThat(movimientoCaptor.getValue().getTipoMovimiento()).isEqualTo(TipoMovimiento.AJUSTE);
        then(kafkaProducer).should().enviarEventoActualizacion(any(Inventario.class));
    }

    @Test
    void actualizarStock_menorReserva_lanzaIllegalArgumentException() {
        given(inventarioRepository.findBySku("SKU-123")).willReturn(Optional.of(inventarioExistente));

        assertThatThrownBy(() -> service.actualizarStock("SKU-123", 10, "Ajuste erróneo"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("El stock total no puede ser menor al stock reservado");
    }

    @Test
    void obtenerMovimientos_retornaMovimientoDTOsOrdenados() {
        MovimientoInventario movimiento = MovimientoInventario.builder()
                .id(7L)
                .inventario(inventarioExistente)
                .tipoMovimiento(TipoMovimiento.RESERVA)
                .cantidad(10)
                .motivo("Reserva")
                .build();

        given(movimientoRepository.findByInventario_IdOrderByFechaDesc(1L)).willReturn(List.of(movimiento));

        var movimientos = service.obtenerMovimientos(1L);

        assertThat(movimientos).hasSize(1);
        assertThat(movimientos.get(0).getTipoMovimiento()).isEqualTo(TipoMovimiento.RESERVA.name());
        assertThat(movimientos.get(0).getCantidad()).isEqualTo(10);
    }
}
