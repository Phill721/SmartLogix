package com.smartlogix.pedidos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoListaResponseDTO {
    private Long id;
    private String estado;
    private BigDecimal total;
    private LocalDateTime fechaCreacion;
    private Integer cantidadItems;
}
