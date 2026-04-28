package com.smartlogix.Productos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.smartlogix.Productos.models.Producto;
import com.smartlogix.Productos.repository.ProductoRepository;

@Service
public class ProductoService {

    private final ProductoRepository repository;

    public ProductoService(ProductoRepository repository) {
        this.repository = repository;
    }

    public Producto crearProducto(Producto producto) {
        return repository.save(producto);
    }

    public List<Producto> listarProductos() {
        return repository.findAll();
    }

    public Optional<Producto> obtenerPorSku(String sku) {
        return repository.findBySku(sku);
    }

    public List<Producto> obtenerPorCategoria(String categoria) {
        return repository.findByCategoria(categoria);
    }

    public Producto actualizarProducto(String sku, Producto nuevoProducto) {
        return repository.findBySku(sku).map(producto -> {
            producto.setNombre(nuevoProducto.getNombre());
            producto.setDescripcion(nuevoProducto.getDescripcion());
            producto.setCategoria(nuevoProducto.getCategoria());
            return repository.save(producto);
        }).orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    public void eliminarProducto(Long id) {
        repository.deleteById(id);
    }
}
