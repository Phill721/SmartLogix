package com.smartlogix.Productos.service;

import com.smartlogix.Productos.dto.ProductoRequestDTO;
import com.smartlogix.Productos.dto.ProductoResponseDTO;
import com.smartlogix.Productos.exception.ProductoNotFoundException;
import com.smartlogix.Productos.exception.SkuDuplicadoException;
import com.smartlogix.Productos.factory.ProductoFactory;
import com.smartlogix.Productos.mapper.ProductoMapper;
import com.smartlogix.Productos.models.Producto;
import com.smartlogix.Productos.repository.ProductoRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ProductoService {

    private final ProductoRepository repository;

    public ProductoService(ProductoRepository repository) {
        this.repository = repository;
    }

    @CacheEvict(value = {"productos", "producto"}, allEntries = true)
    public ProductoResponseDTO crearProducto(ProductoRequestDTO dto) {

        if (repository.existsBySkuIgnoreCase(dto.getSku())) {
            throw new SkuDuplicadoException("Ya existe un producto con ese SKU");
        }

        Producto producto = ProductoFactory.crearProducto(dto);

        return ProductoMapper.toDTO(repository.save(producto));
    }

    @Cacheable(value = "productos")
    public Page<ProductoResponseDTO> listarProductos(int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        return repository.findAll(pageable)
                .map(ProductoMapper::toDTO);
    }

    @Cacheable(value = "producto", key = "#sku")
    public ProductoResponseDTO obtenerPorSku(String sku) {

        Producto producto = repository.findBySkuIgnoreCase(sku)
                .orElseThrow(() ->
                        new ProductoNotFoundException("Producto no encontrado")
                );

        return ProductoMapper.toDTO(producto);
    }

    public Page<ProductoResponseDTO> buscarPorNombre(
            String nombre,
            int page,
            int size
    ) {

        Pageable pageable = PageRequest.of(page, size);

        return repository.findByNombreContainingIgnoreCase(nombre, pageable)
                .map(ProductoMapper::toDTO);
    }

    public Page<ProductoResponseDTO> buscarPorCategoria(
            String categoria,
            int page,
            int size
    ) {

        Pageable pageable = PageRequest.of(page, size);

        return repository.findByCategoriaIgnoreCase(categoria, pageable)
                .map(ProductoMapper::toDTO);
    }

    public Page<ProductoResponseDTO> buscarPorPrecio(
            BigDecimal min,
            BigDecimal max,
            int page,
            int size
    ) {

        Pageable pageable = PageRequest.of(page, size);

        return repository.findByPrecioBetween(min, max, pageable)
                .map(ProductoMapper::toDTO);
    }

    @CacheEvict(value = {"productos", "producto"}, allEntries = true)
    public ProductoResponseDTO actualizar(String sku, ProductoRequestDTO dto) {

        Producto producto = repository.findBySkuIgnoreCase(sku)
                .orElseThrow(() ->
                        new ProductoNotFoundException("Producto no encontrado")
                );

        if (!producto.getSku().equals(dto.getSku())
                && repository.existsBySkuIgnoreCase(dto.getSku())) {

            throw new SkuDuplicadoException(
                    "Ya existe un producto con ese SKU"
            );
        }

        producto.setSku(dto.getSku());
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setCategoria(dto.getCategoria());
        producto.setImagenes(dto.getImagenes());

        return ProductoMapper.toDTO(repository.save(producto));
    }

    @CacheEvict(value = {"productos", "producto"}, allEntries = true)
    public void eliminar(String sku) {

        Producto producto = repository.findBySkuIgnoreCase(sku)
                .orElseThrow(() ->
                        new ProductoNotFoundException("Producto no encontrado")
                );

        repository.delete(producto);
    }
}

