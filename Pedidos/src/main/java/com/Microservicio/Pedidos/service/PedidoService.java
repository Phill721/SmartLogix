package com.Microservicio.Pedidos.service;

import com.Microservicio.Pedidos.dto.ActualizarEstadoRequest;
import com.Microservicio.Pedidos.dto.CancelarPedidoRequest;
import com.Microservicio.Pedidos.dto.CrearPedidoRequest;
import com.Microservicio.Pedidos.dto.PedidoResponse;
import java.util.List;

public interface PedidoService {
    PedidoResponse crearPedido(CrearPedidoRequest request);

    List<PedidoResponse> listarPedidos(Long usuarioId, boolean esAdmin);

    PedidoResponse obtenerPedido(Long id, Long usuarioId, boolean esAdmin);

    PedidoResponse cancelarPedido(Long id, Long usuarioId, boolean esAdmin, CancelarPedidoRequest request);

    PedidoResponse actualizarEstado(Long id, ActualizarEstadoRequest request);
}
