package com.smartlogix.pedidos.service;

import com.smartlogix.pedidos.dto.*;
import com.smartlogix.pedidos.entity.Carrito;
import com.smartlogix.pedidos.entity.CarritoItem;
import com.smartlogix.pedidos.exception.CarritoVacioException;
import com.smartlogix.pedidos.mapper.PedidoMapper;
import com.smartlogix.pedidos.repository.CarritoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final PedidoMapper mapper;

    public CarritoResponseDTO obtenerCarritoPorUsuario(Long usuarioId) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> crearCarritoNuevo(usuarioId));
        return mapper.toCarritoResponseDTO(carrito);
    }

    public CarritoResponseDTO agregarAlCarrito(Long usuarioId, AgregarAlCarritoRequestDTO request) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> crearCarritoNuevo(usuarioId));

        // Verificar si el producto ya está en el carrito
        boolean productoExiste = carrito.getItems().stream()
                .anyMatch(item -> item.getSku().equals(request.getSku()));

        if (productoExiste) {
            CarritoItem itemExistente = carrito.getItems().stream()
                    .filter(item -> item.getSku().equals(request.getSku()))
                    .findFirst()
                    .orElse(null);
            
            if (itemExistente != null) {
                itemExistente.setCantidad(itemExistente.getCantidad() + request.getCantidad());
                itemExistente.calcularSubtotal();
                log.info("Cantidad actualizada para producto SKU: {} en carrito del usuario: {}", request.getSku(), usuarioId);
            }
        } else {
            CarritoItem nuevoItem = mapper.toCarritoItem(request);
            carrito.agregarItem(nuevoItem);
            log.info("Producto agregado al carrito. SKU: {}, Usuario: {}", request.getSku(), usuarioId);
        }

        carrito.setFechaActualizacion(LocalDateTime.now());
        Carrito carritoActualizado = carritoRepository.save(carrito);
        return mapper.toCarritoResponseDTO(carritoActualizado);
    }

    public CarritoResponseDTO removerDelCarrito(Long usuarioId, Long itemId) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new CarritoVacioException("Carrito no encontrado para el usuario"));

        carrito.removerItem(itemId);
        carrito.setFechaActualizacion(LocalDateTime.now());
        
        Carrito carritoActualizado = carritoRepository.save(carrito);
        log.info("Item removido del carrito. ItemId: {}, Usuario: {}", itemId, usuarioId);
        
        return mapper.toCarritoResponseDTO(carritoActualizado);
    }

    public void vaciarCarrito(Long usuarioId) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new CarritoVacioException("Carrito no encontrado para el usuario"));

        carrito.vaciar();
        carrito.setFechaActualizacion(LocalDateTime.now());
        carritoRepository.save(carrito);
        
        log.info("Carrito vaciado para usuario: {}", usuarioId);
    }

    public CarritoResponseDTO actualizarCantidadItem(Long usuarioId, Long itemId, Integer nuevaCantidad) {
        if (nuevaCantidad <= 0) {
            return removerDelCarrito(usuarioId, itemId);
        }

        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new CarritoVacioException("Carrito no encontrado para el usuario"));

        CarritoItem item = carrito.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new CarritoVacioException("Item no encontrado en el carrito"));

        item.setCantidad(nuevaCantidad);
        item.calcularSubtotal();
        carrito.calcularTotal();
        carrito.setFechaActualizacion(LocalDateTime.now());

        Carrito carritoActualizado = carritoRepository.save(carrito);
        log.info("Cantidad actualizada para item: {}. Nueva cantidad: {}", itemId, nuevaCantidad);
        
        return mapper.toCarritoResponseDTO(carritoActualizado);
    }

    private Carrito crearCarritoNuevo(Long usuarioId) {
        Carrito nuevoCarrito = Carrito.builder()
                .usuarioId(usuarioId)
                .fechaCreacion(LocalDateTime.now())
                .build();
        
        Carrito carrito = carritoRepository.save(nuevoCarrito);
        log.info("Nuevo carrito creado para usuario: {}", usuarioId);
        return carrito;
    }
}
