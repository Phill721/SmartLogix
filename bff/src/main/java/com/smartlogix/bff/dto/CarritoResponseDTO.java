package com.smartlogix.bff.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
public class CarritoResponseDTO {

    private Long id;

    private Long usuarioId;

    private List<CarritoItemDTO> items;

    private BigDecimal total;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaActualizacion;
}