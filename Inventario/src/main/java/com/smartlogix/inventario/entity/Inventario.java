package com.smartlogix.inventario.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    @NotBlank(message = "El SKU es obligatorio")
    private String sku;

    private Long productoId;
    private Long bodegaId;

    @Column(nullable = false)
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stockTotal;

    @Column(nullable = false)
    private Integer stockReservado = 0;

    @Column(nullable = false)
    private Integer umbralMinimo = 10;

    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }

    public Integer getStockDisponible() {
        return this.stockTotal - this.stockReservado;
    }
}
