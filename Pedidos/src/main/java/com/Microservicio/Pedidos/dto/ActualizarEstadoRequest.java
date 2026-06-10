package com.Microservicio.Pedidos.dto;

import com.Microservicio.Pedidos.model.EstadoPedido;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarEstadoRequest {
    private EstadoPedido nuevoEstado;
    private String actualizadoPor;
}
