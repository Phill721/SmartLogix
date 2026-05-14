package com.smartlogix.pedidos.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoCanceladoEvent {
    private Long pedidoId;
    private Long usuarioId;
    private LocalDateTime timestamp;
    private List<ItemCancelableEvent> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemCancelableEvent {
        private String sku;
        private Integer cantidad;
    }
}
