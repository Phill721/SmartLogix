package com.smartlogix.pedidos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoResponseDTO {
    private Long id;
    private Long usuarioId;
    private Long carritoId;
    private String estado;
    private List<ItemPedidoDTO> items;
    private List<HistorialEstadoDTO> historial;
    private BigDecimal total;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private String motivoRechazo;
}
