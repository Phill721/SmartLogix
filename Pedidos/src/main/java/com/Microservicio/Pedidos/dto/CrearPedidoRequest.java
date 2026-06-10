package com.Microservicio.Pedidos.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearPedidoRequest {
    private Long usuarioId;
    private Double total;
    private List<PedidoItemRequest> items;
}
