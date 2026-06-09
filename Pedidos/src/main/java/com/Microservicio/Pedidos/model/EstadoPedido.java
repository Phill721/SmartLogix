package com.Microservicio.Pedidos.model;

import java.util.Set;

public enum EstadoPedido {
    PENDIENTE,
    CONFIRMADO,
    ENVIADO,
    ENTREGADO,
    CANCELADO;

    public boolean puedeCancelar() {
        return this == PENDIENTE || this == CONFIRMADO;
    }

    public Set<EstadoPedido> siguientesValidos() {
        return switch (this) {
            case PENDIENTE -> Set.of(CONFIRMADO, CANCELADO);
            case CONFIRMADO -> Set.of(ENVIADO, CANCELADO);
            case ENVIADO -> Set.of(ENTREGADO);
            case ENTREGADO, CANCELADO -> Set.of();
        };
    }
}
