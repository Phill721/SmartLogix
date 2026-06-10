package com.Microservicio.Pedidos.dto;

import com.Microservicio.Pedidos.model.EstadoPedido;
import com.Microservicio.Pedidos.model.HistorialEstado;
import com.Microservicio.Pedidos.model.PedidoItem;
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
public class PedidoResponse {
    private Long id;
    private Long usuarioId;
    private EstadoPedido estado;
    private Double total;
    private LocalDateTime fechaCreacion;
    private List<PedidoItem> items;
    private List<HistorialEstado> historialEstados;
}
