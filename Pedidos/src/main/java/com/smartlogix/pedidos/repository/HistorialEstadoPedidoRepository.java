package com.smartlogix.pedidos.repository;

import com.smartlogix.pedidos.entity.HistorialEstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialEstadoPedidoRepository extends JpaRepository<HistorialEstadoPedido, Long> {
    List<HistorialEstadoPedido> findByPedido_IdOrderByTimestampAsc(Long pedidoId);
}
