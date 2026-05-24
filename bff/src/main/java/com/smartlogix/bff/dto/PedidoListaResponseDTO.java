package com.smartlogix.bff.dto;

import java.math.BigDecimal;
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
public class PedidoListaResponseDTO {

    private Long id;

    private String estado;

    private BigDecimal total;

    private LocalDateTime fechaCreacion;
}