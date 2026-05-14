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
public class HistorialEstadoDTO {
    private Long id;
    private String estadoAnterior;
    private String estadoNuevo;
    private LocalDateTime timestamp;
    private String motivo;
}
