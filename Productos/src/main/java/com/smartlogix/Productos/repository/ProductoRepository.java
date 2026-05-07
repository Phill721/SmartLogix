package com.smartlogix.Productos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartlogix.Productos.models.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findBySku(String sku);

    List<Producto> findByCategoriaIgnoreCase(String categoria);
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
}