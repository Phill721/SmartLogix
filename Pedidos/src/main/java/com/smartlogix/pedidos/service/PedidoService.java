package com.smartlogix.pedidos.service;

import com.smartlogix.pedidos.dto.CrearPedidoRequestDTO;
import com.smartlogix.pedidos.dto.PageResponse;
import com.smartlogix.pedidos.dto.PedidoListaResponseDTO;
import com.smartlogix.pedidos.dto.PedidoResponseDTO;
import com.smartlogix.pedidos.entity.Carrito;
import com.smartlogix.pedidos.entity.Pedido;
import com.smartlogix.pedidos.event.PedidoCanceladoEvent;
import com.smartlogix.pedidos.event.PedidoCreadoEvent;
import com.smartlogix.pedidos.exception.*;
import com.smartlogix.pedidos.kafka.PedidoKafkaProducer;
import com.smartlogix.pedidos.mapper.PedidoMapper;
import com.smartlogix.pedidos.model.EstadoPedido;
import com.smartlogix.pedidos.repository.CarritoRepository;
import com.smartlogix.pedidos.repository.PedidoRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final CarritoRepository carritoRepository;
    private final PedidoKafkaProducer kafkaProducer;
    private final PedidoMapper mapper;

    public PedidoResponseDTO crearPedido(Long usuarioId, CrearPedidoRequestDTO request) {
        log.info("Iniciando creación de pedido para usuario: {}", usuarioId);

        Long carritoId = request.getCarritoId();
        Carrito carrito = carritoRepository.findById(carritoId)
            .orElseThrow(() -> new CarritoNoEncontradoException("Carrito no encontrado"));

        if (!carrito.getUsuarioId().equals(usuarioId)) {
            throw new IllegalArgumentException("No tienes permisos para usar este carrito");
        }

        if (carrito.getItems() == null || carrito.getItems().isEmpty()) {
            throw new CarritoVacioException("El carrito no tiene productos");
        }

        Pedido pedido = mapper.toPedido(carrito);
        pedido.setUsuarioId(usuarioId);
        pedido.setEstado(EstadoPedido.PENDIENTE);

        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        // Registrar cambio de estado inicial
        pedidoGuardado.registrarCambioEstado(EstadoPedido.PENDIENTE, "Pedido creado");
        pedidoRepository.save(pedidoGuardado);

        // Publicar evento
        publicarPedidoCreado(pedidoGuardado);

        log.info("Pedido creado exitosamente. ID: {}, Usuario: {}", pedidoGuardado.getId(), usuarioId);
        return mapper.toPedidoResponseDTO(pedidoGuardado);
    }

    @Retry(name = "inventario", fallbackMethod = "confirmarPedidoFallback")
    @io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker(name = "inventario", fallbackMethod = "confirmarPedidoFallback")
    public PedidoResponseDTO confirmarPedido(Long pedidoId, Long usuarioId) {
        log.info("Confirmando pedido: {} para usuario: {}", pedidoId, usuarioId);

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new PedidoNotFoundException("Pedido no encontrado"));

        if (!pedido.getUsuarioId().equals(usuarioId)) {
            throw new IllegalArgumentException("No tienes permisos para confirmar este pedido");
        }

        if (!pedido.getEstado().equals(EstadoPedido.PENDIENTE)) {
            throw new EstadoPedidoInvalidoException("El pedido no puede ser confirmado desde estado: " + pedido.getEstado());
        }

        // Intentar reservar stock
        try {
            reservarStockEnInventario(pedido);
            
            pedido.registrarCambioEstado(EstadoPedido.CONFIRMADO, "Stock reservado exitosamente");
            Pedido pedidoActualizado = pedidoRepository.save(pedido);
            
            log.info("Pedido confirmado: {}", pedidoId);
            return mapper.toPedidoResponseDTO(pedidoActualizado);
        } catch (StockInsuficienteException e) {
            pedido.registrarCambioEstado(EstadoPedido.RECHAZADO, "Stock insuficiente: " + e.getMessage());
            pedido.setMotivoRechazo(e.getMessage());
            pedidoRepository.save(pedido);
            
            log.warn("Pedido rechazado por stock insuficiente: {}", pedidoId);
            throw e;
        }
    }

    public PedidoResponseDTO confirmarPedidoFallback(Long pedidoId, Long usuarioId, Exception ex) {
        log.error("Error al confirmar pedido (Circuit Breaker activo): {}", ex.getMessage());
        throw new CircuitBreakerAbiertoException("El servicio de inventario no está disponible. Intente más tarde.");
    }

    public PedidoResponseDTO cancelarPedido(Long pedidoId, Long usuarioId) {
        log.info("Cancelando pedido: {} para usuario: {}", pedidoId, usuarioId);

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new PedidoNotFoundException("Pedido no encontrado"));

        if (!pedido.getUsuarioId().equals(usuarioId)) {
            throw new IllegalArgumentException("No tienes permisos para cancelar este pedido");
        }

        if (!pedido.getEstado().equals(EstadoPedido.PENDIENTE) && 
            !pedido.getEstado().equals(EstadoPedido.CONFIRMADO)) {
            throw new EstadoPedidoInvalidoException("El pedido no puede ser cancelado desde estado: " + pedido.getEstado());
        }

        // Publicar evento de cancelación
        publicarPedidoCancelado(pedido);

        pedido.registrarCambioEstado(EstadoPedido.CANCELADO, "Cancelado por el usuario");
        Pedido pedidoActualizado = pedidoRepository.save(pedido);

        limpiarCarritoAsociado(pedido);

        log.info("Pedido cancelado: {}", pedidoId);
        return mapper.toPedidoResponseDTO(pedidoActualizado);
    }

    public PedidoResponseDTO obtenerPedido(Long pedidoId, Long usuarioId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new PedidoNotFoundException("Pedido no encontrado"));

        if (!pedido.getUsuarioId().equals(usuarioId)) {
            throw new IllegalArgumentException("No tienes permisos para ver este pedido");
        }

        return mapper.toPedidoResponseDTO(pedido);
    }

    public PageResponse<PedidoListaResponseDTO> listarPedidosPorUsuario(Long usuarioId, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Pedido> pedidos = pedidoRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId, pageable);
        return convertToPageResponse(mapper.toPedidoListaResponseDTOPage(pedidos));
    }

    public PageResponse<PedidoListaResponseDTO> listarPedidosPorUsuarioYEstado(Long usuarioId, String estado, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        EstadoPedido estadoPedido = EstadoPedido.valueOf(estado.toUpperCase());
        Page<Pedido> pedidos = pedidoRepository.findByUsuarioIdAndEstadoOrderByFechaCreacionDesc(usuarioId, estadoPedido, pageable);
        return convertToPageResponse(mapper.toPedidoListaResponseDTOPage(pedidos));
    }

    public PageResponse<PedidoListaResponseDTO> listarTodos(Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Pedido> pedidos = pedidoRepository.findAllByOrderByFechaCreacionDesc(pageable);
        return convertToPageResponse(mapper.toPedidoListaResponseDTOPage(pedidos));
    }

    // Métodos privados

    private void reservarStockEnInventario(Pedido pedido) {
        // TODO: Implementar reserva de stock con gRPC
        // for (ItemPedido item : pedido.getItems()) {
        //     inventarioGrpcClient.reservarStock(item.getSku(), item.getCantidad(), pedido.getId().toString());
        // }
    }

    private void limpiarCarritoAsociado(Pedido pedido) {
        if (pedido.getCarritoId() == null) {
            return;
        }

        carritoRepository.findById(pedido.getCarritoId()).ifPresent(carrito -> {
            carrito.vaciar();
            carritoRepository.save(carrito);
        });
    }

    private void publicarPedidoCreado(Pedido pedido) {
        PedidoCreadoEvent event = PedidoCreadoEvent.builder()
                .pedidoId(pedido.getId())
                .usuarioId(pedido.getUsuarioId())
                .estado(pedido.getEstado().toString())
                .total(pedido.getTotal())
                .timestamp(LocalDateTime.now())
                .items(pedido.getItems().stream()
                        .map(item -> PedidoCreadoEvent.ItemPedidoEvent.builder()
                                .sku(item.getSku())
                                .cantidad(item.getCantidad())
                                .build())
                        .collect(Collectors.toList()))
                .build();

        try {
            kafkaProducer.publicarPedidoCreado(event);
        } catch (Exception e) {
            log.error("Error publicando evento PedidoCreado: {}", e.getMessage(), e);
        }
    }

    private void publicarPedidoCancelado(Pedido pedido) {
        PedidoCanceladoEvent event = PedidoCanceladoEvent.builder()
                .pedidoId(pedido.getId())
                .usuarioId(pedido.getUsuarioId())
                .timestamp(LocalDateTime.now())
                .items(pedido.getItems().stream()
                        .map(item -> PedidoCanceladoEvent.ItemCancelableEvent.builder()
                                .sku(item.getSku())
                                .cantidad(item.getCantidad())
                                .build())
                        .collect(Collectors.toList()))
                .build();

        try {
            kafkaProducer.publicarPedidoCancelado(event);
        } catch (Exception e) {
            log.error("Error publicando evento PedidoCancelado: {}", e.getMessage(), e);
        }
    }

    private <T> PageResponse<T> convertToPageResponse(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
