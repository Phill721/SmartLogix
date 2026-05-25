package com.smartlogix.inventario.service;

import com.smartlogix.inventario.dto.AjusteRequest;
import com.smartlogix.inventario.dto.InventarioRequest;
import com.smartlogix.inventario.dto.MovimientoDTO;
import com.smartlogix.inventario.entity.Inventario;
import com.smartlogix.inventario.entity.MovimientoInventario;

import java.util.List;

public interface InventarioService {

    Inventario crearInventario(String token, InventarioRequest request);

    Inventario obtenerPorSku(String sku);

    List<Inventario> obtenerPorBodega(Long bodegaId);

    Inventario ajusteManual(Long id, AjusteRequest request);

    void reservarStock(String sku, int cantidad, String pedidoId);

    void confirmarVenta(String sku, int cantidad, String pedidoId);

    void liberarStock(String sku, int cantidad, String pedidoId);

    void actualizarStock(String sku, int nuevaCantidad, String motivo);

    List<MovimientoDTO> obtenerMovimientos(Long inventarioId);
}
