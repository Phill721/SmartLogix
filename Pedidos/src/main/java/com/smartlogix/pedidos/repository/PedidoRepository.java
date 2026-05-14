package com.smartlogix.pedidos.repository;

import com.smartlogix.pedidos.entity.Pedido;
import com.smartlogix.pedidos.model.EstadoPedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    Page<Pedido> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId, Pageable pageable);

    Page<Pedido> findByUsuarioIdAndEstadoOrderByFechaCreacionDesc(Long usuarioId, EstadoPedido estado, Pageable pageable);

    Page<Pedido> findByUsuarioIdAndFechaCreacionBetweenOrderByFechaCreacionDesc(
            Long usuarioId,
            LocalDateTime fechaInicio,
            LocalDateTime fechaFin,
            Pageable pageable
    );

    Page<Pedido> findByEstadoOrderByFechaCreacionDesc(EstadoPedido estado, Pageable pageable);

    Page<Pedido> findAllByOrderByFechaCreacionDesc(Pageable pageable);
}
