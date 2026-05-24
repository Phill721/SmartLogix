package com.smartlogix.bff.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistorialEstadoPedidoDTO {

    private Long id;

    private String estadoAnterior;

    private String estadoNuevo;

    private LocalDateTime timestamp;

    private String motivo;
}