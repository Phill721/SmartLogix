package com.smartlogix.inventario.service;

import com.smartlogix.inventario.dto.*;
import com.smartlogix.inventario.entity.Inventario;
import com.smartlogix.inventario.entity.MovimientoInventario;

import java.util.List;

public interface InventarioService {
    Inventario crearInventario(InventarioRequest request);
    Inventario obtenerPorSku(String sku);
    List<Inventario> obtenerPorBodega(Long bodegaId);
    Inventario ajusteManual(Long id, AjusteRequest request);
    List<MovimientoInventario> obtenerMovimientos(Long inventarioId);
    
    // Métodos para gRPC y Kafka
    void reservarStock(String sku, int cantidad, String pedidoId);
    void liberarStock(String sku, int cantidad, String pedidoId);
    void actualizarStock(String sku, int nuevaCantidad, String motivo);
}