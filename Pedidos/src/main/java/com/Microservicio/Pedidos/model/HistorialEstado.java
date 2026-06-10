package com.Microservicio.Pedidos.model;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistorialEstado {
    private EstadoPedido estado;
    private LocalDateTime fecha;
    private String usuario;
}
