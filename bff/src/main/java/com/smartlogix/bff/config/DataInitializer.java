package main.java.com.smartlogix.bff.config;

import com.smartlogix.bff.client.InventarioClient;
import com.smartlogix.bff.client.ProductosClient;
import com.smartlogix.bff.dto.InventarioRequestDTO;
import com.smartlogix.bff.dto.ProductoRequestDTO;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductosClient productosClient;
    private final InventarioClient inventarioClient;

    public DataInitializer(ProductosClient productosClient, InventarioClient inventarioClient) {
        this.productosClient = productosClient;
        this.inventarioClient = inventarioClient;
    }

    @Override
    public void run(String... args) {
        System.out.println("Inicializando datos de prueba en SmartLogix...");

        // 1. Productos de ejemplo
        crearProducto("SKU-001", "Laptop Gamer", "Laptop con RTX 4060 y 16GB RAM", 
                      new BigDecimal("1200000"), "Electrónica", 
                      List.of("laptop1.jpg", "laptop2.jpg"));

        crearProducto("SKU-002", "Mouse Inalámbrico", "Mouse ergonómico Bluetooth con 3 niveles de DPI", 
                      new BigDecimal("45000"), "Accesorios", 
                      List.of("mouse1.jpg"));

        crearProducto("SKU-003", "Teclado Mecánico", "Teclado RGB con switches blue y reposamuñecas", 
                      new BigDecimal("89000"), "Accesorios", 
                      List.of("teclado1.jpg", "teclado2.jpg"));

        crearProducto("SKU-004", "Monitor 27\"", "Monitor 4K UHD 144Hz con HDR", 
                      new BigDecimal("450000"), "Electrónica", 
                      List.of("monitor1.jpg"));

        crearProducto("SKU-005", "Auriculares", "Auriculares con cancelación de ruido y sonido envolvente", 
                      new BigDecimal("120000"), "Audio", 
                      List.of("auriculares1.jpg", "auriculares2.jpg"));

        System.out.println("Datos de prueba cargados correctamente.");
    }

    private void crearProducto(String sku, String nombre, String descripcion, 
                               BigDecimal precio, String categoria, List<String> imagenes) {
        try {
            // Verificar si el producto ya existe (opcional)
            try {
                productosClient.obtenerProductoPorSku(sku);
                System.out.println("   Producto ya existe: " + sku + " (saltando)");
                return;
            } catch (Exception e) {
                // No existe, continuar
                System.out.println("   Creando producto: " + sku + " - " + nombre);
            }

            // 1. Crear el producto
            ProductoRequestDTO producto = new ProductoRequestDTO();
            producto.setSku(sku);
            producto.setNombre(nombre);
            producto.setDescripcion(descripcion);
            producto.setPrecio(precio);
            producto.setCategoria(categoria);
            producto.setImagenes(imagenes);

            var productoCreado = productosClient.crearProducto(producto);
            System.out.println("   Producto creado con ID: " + productoCreado.getId());

            // 2. Crear inventario (stock inicial)
            InventarioRequestDTO inventario = new InventarioRequestDTO();
            inventario.setSku(sku);
            inventario.setStockTotal(10);          // stock inicial
            inventario.setStockReservado(0);
            inventario.setUmbralMinimo(3);
            inventario.setBodegaId(1L);
            inventario.setProductoId(productoCreado.getId());

            inventarioClient.crearInventario(inventario);
            System.out.println("   Inventario creado para " + sku + " (stock: 10)");

        } catch (Exception e) {
            System.err.println("   Error al crear " + sku + ": " + e.getMessage());
        }
    }
}