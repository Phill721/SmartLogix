package com.smartlogix.pedidos.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoCreadoEvent {
    private Long pedidoId;
    private Long usuarioId;
    private String estado;
    private BigDecimal total;
    private LocalDateTime timestamp;
    private List<ItemPedidoEvent> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemPedidoEvent {
        private String sku;
        private Integer cantidad;
    }
}
