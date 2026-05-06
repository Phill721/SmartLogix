package com.smartlogix.Productos.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.smartlogix.Productos.dto.ProductoRequestDTO;
import com.smartlogix.Productos.dto.ProductoResponseDTO;
import com.smartlogix.Productos.factory.ProductoFactory;
import com.smartlogix.Productos.mapper.ProductoMapper;
import com.smartlogix.Productos.models.Producto;
import com.smartlogix.Productos.repository.ProductoRepository;

@Service
public class ProductoService {

    private final ProductoRepository repository;

    public ProductoService(ProductoRepository repository) {
        this.repository = repository;
    }

    public ProductoResponseDTO crearProducto(ProductoRequestDTO dto) {
        Producto producto = ProductoFactory.crearProducto(dto);
        return ProductoMapper.toDTO(repository.save(producto));
    }

    public List<ProductoResponseDTO> listarProductos() {
        return repository.findAll()
                .stream()
                .map(ProductoMapper::toDTO)
                .collect(Collectors.toList());
    }

    public ProductoResponseDTO obtenerPorSku(String sku) {
        Producto producto = repository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return ProductoMapper.toDTO(producto);
    }

    public List<ProductoResponseDTO> porCategoria(String categoria) {
        return repository.findByCategoria(categoria)
                .stream()
                .map(ProductoMapper::toDTO)
                .collect(Collectors.toList());
    }

    public ProductoResponseDTO actualizar(String sku, ProductoRequestDTO dto) {
        Producto producto = repository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setCategoria(dto.getCategoria());

        return ProductoMapper.toDTO(repository.save(producto));
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}