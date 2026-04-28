package com.smartlogix.inventario.dto;

import com.smartlogix.inventario.entity.TipoMovimiento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovimientoDTO {
    private Long id;
    private String sku;
    private TipoMovimiento tipoMovimiento;
    private Integer cantidad;
    private String motivo;
    private LocalDateTime fechaCreacion;
}