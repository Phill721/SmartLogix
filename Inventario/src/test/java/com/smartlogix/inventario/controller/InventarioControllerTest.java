package com.smartlogix.inventario.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.inventario.dto.AjusteRequest;
import com.smartlogix.inventario.dto.InventarioRequest;
import com.smartlogix.inventario.dto.MovimientoDTO;
import com.smartlogix.inventario.entity.Inventario;
import com.smartlogix.inventario.exception.GlobalExceptionHandler;
import com.smartlogix.inventario.exception.ProductoNoEncontradoException;
import com.smartlogix.inventario.service.InventarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class InventarioControllerTest {

    @Mock
    private InventarioService service;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        InventarioController controller = new InventarioController(service);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void crearInventario_retorna201ConInventario() throws Exception {
        InventarioRequest request = new InventarioRequest();
        request.setSku("SKU-111");
        request.setProductoId(1L);
        request.setBodegaId(2L);
        request.setStockTotal(30);
        request.setUmbralMinimo(5);

        Inventario inventario = Inventario.builder()
                .id(10L)
                .sku("SKU-111")
                .productoId(1L)
                .bodegaId(2L)
                .stockTotal(30)
                .stockReservado(0)
                .umbralMinimo(5)
                .build();

        given(service.crearInventario(eq("Bearer token"), any(InventarioRequest.class)))
                .willReturn(inventario);

        mockMvc.perform(post("/api/inventario")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer token")
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sku").value("SKU-111"))
                .andExpect(jsonPath("$.stockTotal").value(30));

        verify(service).crearInventario(eq("Bearer token"), any(InventarioRequest.class));
    }

    @Test
    void obtenerPorSku_noExiste_devuelveBadRequestConError() throws Exception {
        given(service.obtenerPorSku("NOEX"))
                .willThrow(new ProductoNoEncontradoException("Producto no encontrado con SKU: NOEX"));

        mockMvc.perform(get("/api/inventario/NOEX")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Producto no encontrado con SKU: NOEX"));
    }

    @Test
    void obtenerMovimientos_retornaListaDeMovimientos() throws Exception {
        MovimientoDTO movimiento = MovimientoDTO.builder()
                .id(1L)
                .cantidad(5)
                .tipoMovimiento("RESERVA")
                .motivo("Reserva de prueba")
                .fecha(LocalDateTime.now())
                .usuarioResponsable("admin")
                .build();

        given(service.obtenerMovimientos(1L)).willReturn(List.of(movimiento));

        mockMvc.perform(get("/api/inventario/1/movimientos")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tipoMovimiento").value("RESERVA"))
                .andExpect(jsonPath("$[0].cantidad").value(5));

        verify(service).obtenerMovimientos(1L);
    }

    @Test
    void obtenerPorBodega_retornaInventarios() throws Exception {
        Inventario inventario = Inventario.builder()
                .id(1L)
                .sku("SKU-BOG")
                .productoId(3L)
                .bodegaId(10L)
                .stockTotal(40)
                .stockReservado(5)
                .umbralMinimo(10)
                .build();

        given(service.obtenerPorBodega(10L)).willReturn(List.of(inventario));

        mockMvc.perform(get("/api/inventario/bodega/10")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sku").value("SKU-BOG"))
                .andExpect(jsonPath("$[0].stockTotal").value(40));

        verify(service).obtenerPorBodega(10L);
    }

    @Test
    void ajusteManual_retornaInventarioActualizado() throws Exception {
        AjusteRequest request = new AjusteRequest();
        request.setCantidad(5);
        request.setMotivo("Ajuste correcto");

        Inventario inventario = Inventario.builder()
                .id(1L)
                .sku("SKU-AJS")
                .productoId(4L)
                .bodegaId(11L)
                .stockTotal(55)
                .stockReservado(5)
                .umbralMinimo(10)
                .build();

        given(service.ajusteManual(eq(1L), any(AjusteRequest.class))).willReturn(inventario);

        mockMvc.perform(post("/api/inventario/1/ajuste")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stockTotal").value(55))
                .andExpect(jsonPath("$.sku").value("SKU-AJS"));

        verify(service).ajusteManual(eq(1L), any(AjusteRequest.class));
    }

    @Test
    void ajusteManual_noExiste_devuelveBadRequest() throws Exception {
        AjusteRequest request = new AjusteRequest();
        request.setCantidad(5);
        request.setMotivo("Ajuste no existe");

        given(service.ajusteManual(eq(99L), any(AjusteRequest.class)))
                .willThrow(new RuntimeException("ID de inventario no existe"));

        mockMvc.perform(post("/api/inventario/99/ajuste")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("ID de inventario no existe"));
    }
}
