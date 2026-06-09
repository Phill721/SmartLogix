package com.Microservicio.Pedidos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoItemRequest {
    private String sku;
    private Integer cantidad;
    private Integer stockDisponible;
}
