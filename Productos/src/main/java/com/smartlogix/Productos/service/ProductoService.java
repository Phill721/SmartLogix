package com.smartlogix.Productos.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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

    @CacheEvict(value = {"productos", "producto"}, allEntries = true)
    public ProductoResponseDTO crearProducto(ProductoRequestDTO dto) {
        Producto producto = ProductoFactory.crearProducto(dto);
        return ProductoMapper.toDTO(repository.save(producto));
    }

    @Cacheable(value = "productos")
    public List<ProductoResponseDTO> listarProductos() {
        return repository.findAll()
                .stream()
                .map(ProductoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "producto", key = "#sku")
    public ProductoResponseDTO obtenerPorSku(String sku) {
        Producto producto = repository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return ProductoMapper.toDTO(producto);
    }

    @Cacheable(value = "producto", key = "#categoria")
    public List<ProductoResponseDTO> porCategoria(String categoria) {
        return repository.findByCategoria(categoria)
                .stream()
                .map(ProductoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = {"productos", "producto"}, allEntries = true)
    public ProductoResponseDTO actualizar(String sku, ProductoRequestDTO dto) {
        Producto producto = repository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setCategoria(dto.getCategoria());
        producto.setImagenes(dto.getImagenes());

        return ProductoMapper.toDTO(repository.save(producto));
    }

    @CacheEvict(value = {"productos", "producto"}, allEntries = true)
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}