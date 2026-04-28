package com.smartlogix.inventario.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos_inventario")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventario_id")
    private Inventario inventario;

    @Enumerated(EnumType.STRING)
    private TipoMovimiento tipoMovimiento;

    private Integer cantidad;

    private String motivo;

    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}