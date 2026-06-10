package com.Microservicio.Pedidos.repository;

import com.Microservicio.Pedidos.model.Pedido;
import java.util.List;
import java.util.Optional;

public interface PedidoRepository {
    Pedido save(Pedido pedido);

    Optional<Pedido> findById(Long id);

    List<Pedido> findAll();

    List<Pedido> findByUsuarioId(Long usuarioId);
}
