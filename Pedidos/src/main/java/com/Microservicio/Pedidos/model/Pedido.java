package com.Microservicio.Pedidos.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {
    private Long id;
    private Long usuarioId;
    private EstadoPedido estado;
    private Double total;
    private LocalDateTime fechaCreacion;

    @Builder.Default
    private List<PedidoItem> items = new ArrayList<>();

    @Builder.Default
    private List<HistorialEstado> historialEstados = new ArrayList<>();
}
