package com.smartlogix.Productos.service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @CacheEvict(value = { "productos", "producto" }, allEntries = true)
    public ProductoResponseDTO crearProducto(ProductoRequestDTO dto) {
        Producto producto = ProductoFactory.crearProducto(dto);
        return ProductoMapper.toDTO(repository.save(producto));
    }

    @Cacheable(value = "productos")
    public Page<ProductoResponseDTO> listarProductos(Pageable pageable) {

        return repository.findAll(pageable)
                .map(ProductoMapper::toDTO);
    }

    @Cacheable(value = "producto", key = "#sku")
    public ProductoResponseDTO obtenerPorSku(String sku) {
        Producto producto = repository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return ProductoMapper.toDTO(producto);
    }

    @Cacheable(value = "categoria", key = "#categoria + '-' + #pageable.pageNumber")
    public Page<ProductoResponseDTO> porCategoria(String categoria, Pageable pageable) {

        return repository.findByCategoriaIgnoreCase(categoria, pageable)
                .map(ProductoMapper::toDTO);
    }

    @Cacheable(value = "busquedaNombre", key = "#nombre + '-' + #pageable.pageNumber")
    public Page<ProductoResponseDTO> buscarPorNombre(String nombre, Pageable pageable) {

        return repository.findByNombreContainingIgnoreCase(nombre, pageable)
                .map(ProductoMapper::toDTO);
    }

    @CacheEvict(value = { "productos", "producto" }, allEntries = true)
    public ProductoResponseDTO actualizar(String sku, ProductoRequestDTO dto) {
        Producto producto = repository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Validar SKU duplicado
        if (!producto.getSku().equals(dto.getSku())
                && repository.existsBySku(dto.getSku())) {

            throw new RuntimeException("Ya existe un producto con el SKU: " + dto.getSku());
        }
        producto.setSku(dto.getSku());
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setCategoria(dto.getCategoria());
        producto.setImagenes(dto.getImagenes());

        return ProductoMapper.toDTO(repository.save(producto));
    }

    @CacheEvict(value = { "productos", "producto" }, allEntries = true)
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}