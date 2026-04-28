package com.smartlogix.inventario.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartlogix.inventario.entity.MovimientoInventario;

import java.util.List;

/**
 * Repositorio para acceder al historial de movimientos de inventario.
 * Permite consultar el historial de cambios en el stock.
 */
@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

    /**
     * Encuentra todos los movimientos de un inventario específico, ordenados por fecha descendente.
     * @param inventarioId ID del inventario
     * @return Lista de movimientos ordenados por fecha más reciente primero
     */
    List<MovimientoInventario> findByInventario_IdOrderByFechaCreacionDesc(Long inventarioId);
}