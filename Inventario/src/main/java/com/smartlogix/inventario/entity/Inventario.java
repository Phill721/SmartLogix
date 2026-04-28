package com.smartlogix.inventario.entity; // <--- REVISA ESTO

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventarios")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Inventario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long productoId;

    @Column(unique = true, nullable = false)
    private String sku;

    private Long bodegaId;

    private Integer stockDisponible;

    private Integer stockReservado;

    private Integer umbralMinimo;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime fechaCreacion;

    @LastModifiedDate
    private LocalDateTime fechaActualizacion;
}