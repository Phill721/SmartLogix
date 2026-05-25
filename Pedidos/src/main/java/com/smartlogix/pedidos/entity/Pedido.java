package com.smartlogix.pedidos.entity;

import com.smartlogix.pedidos.model.EstadoPedido;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long usuarioId;

    @Column(name = "carrito_id")
    private Long carritoId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPedido estado;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ItemPedido> items = new ArrayList<>();

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<HistorialEstadoPedido> historial = new ArrayList<>();

    @Column(name = "total", nullable = false)
    private BigDecimal total;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(length = 500)
    private String motivoRechazo;

    @PrePersist
    protected void onCreate() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = EstadoPedido.PENDIENTE;
        }
        if (this.total == null) {
            this.total = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    public void calcularTotal() {
        this.total = this.items.stream()
                .map(ItemPedido::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void registrarCambioEstado(EstadoPedido nuevoEstado, String motivo) {
        HistorialEstadoPedido registro = HistorialEstadoPedido.builder()
                .pedido(this)
                .estadoAnterior(this.estado)
                .estadoNuevo(nuevoEstado)
                .motivo(motivo)
                .timestamp(LocalDateTime.now())
                .build();
        this.historial.add(registro);
        this.estado = nuevoEstado;
    }
}
