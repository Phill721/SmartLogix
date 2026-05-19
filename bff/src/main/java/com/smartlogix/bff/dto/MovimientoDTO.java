package com.smartlogix.bff.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class MovimientoDTO {

    private Long id;

    private Integer cantidad;

    private String tipoMovimiento;

    private String motivo;

    private LocalDateTime fecha;

    private String usuarioResponsable;
}