package com.smartlogix.pedidos.grpc;

import com.smartlogix.inventario.InventarioRequest;
import com.smartlogix.inventario.InventarioResponse;
import com.smartlogix.inventario.InventarioServiceGrpc;
import com.smartlogix.pedidos.exception.CircuitBreakerAbiertoException;
import com.smartlogix.pedidos.exception.StockInsuficienteException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.grpc.ManagedChannel;
import io.grpc.StatusRuntimeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventarioGrpcClient {

    private final ManagedChannel inventoryChannel;

    @Retry(name = "inventario", fallbackMethod = "validarStockDisponibleFallback")
    @CircuitBreaker(name = "inventario", fallbackMethod = "validarStockDisponibleFallback")
    public boolean validarStockDisponible(String sku, Integer cantidad) {
        try {
            InventarioServiceGrpc.InventarioServiceBlockingStub stub = 
                    InventarioServiceGrpc.newBlockingStub(inventoryChannel);

            InventarioRequest request = InventarioRequest.newBuilder()
                    .setSku(sku)
                    .setCantidad(cantidad)
                    .build();

            InventarioResponse response = stub.validarStock(request);
            log.info("Stock disponible para SKU: {}, cantidad: {}: {}", sku, cantidad, response.getDisponible());
            
            return response.getDisponible();
        } catch (StatusRuntimeException e) {
            log.error("Error gRPC al validar stock para SKU: {}: {}", sku, e.getMessage());
            throw new CircuitBreakerAbiertoException("No se pudo validar el stock. Intente más tarde.");
        } catch (Exception e) {
            log.error("Error inesperado al validar stock: {}", e.getMessage(), e);
            throw e;
        }
    }

    public boolean validarStockDisponibleFallback(String sku, Integer cantidad, Exception ex) {
        log.warn("Fallback para validarStockDisponible: {}", ex.getMessage());
        throw new CircuitBreakerAbiertoException("El servicio de inventario no está disponible");
    }

    @Retry(name = "inventario", fallbackMethod = "reservarStockFallback")
    @CircuitBreaker(name = "inventario", fallbackMethod = "reservarStockFallback")
    public void reservarStock(String sku, Integer cantidad, String pedidoId) {
        try {
            InventarioServiceGrpc.InventarioServiceBlockingStub stub = 
                    InventarioServiceGrpc.newBlockingStub(inventoryChannel);

            InventarioRequest request = InventarioRequest.newBuilder()
                    .setSku(sku)
                    .setCantidad(cantidad)
                    .setPedidoId(pedidoId)
                    .build();

            InventarioResponse response = stub.reservarStock(request);
            if (!response.getExitoso()) {
                throw new StockInsuficienteException(response.getMensaje());
            }
            log.info("Stock reservado para SKU: {}, cantidad: {}, pedidoId: {}", sku, cantidad, pedidoId);
        } catch (StatusRuntimeException e) {
            log.error("Error gRPC al reservar stock para SKU: {}: {}", sku, e.getMessage());
            throw new CircuitBreakerAbiertoException("No se pudo reservar el stock");
        } catch (StockInsuficienteException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error inesperado al reservar stock: {}", e.getMessage(), e);
            throw e;
        }
    }

    public void reservarStockFallback(String sku, Integer cantidad, String pedidoId, Exception ex) {
        log.warn("Fallback para reservarStock: {}", ex.getMessage());
        throw new CircuitBreakerAbiertoException("El servicio de inventario no está disponible");
    }

    @Retry(name = "inventario", fallbackMethod = "liberarStockFallback")
    @CircuitBreaker(name = "inventario", fallbackMethod = "liberarStockFallback")
    public void liberarStock(String sku, Integer cantidad, String pedidoId) {
        try {
            InventarioServiceGrpc.InventarioServiceBlockingStub stub = 
                    InventarioServiceGrpc.newBlockingStub(inventoryChannel);

            InventarioRequest request = InventarioRequest.newBuilder()
                    .setSku(sku)
                    .setCantidad(cantidad)
                    .setPedidoId(pedidoId)
                    .build();

            InventarioResponse response = stub.liberarStock(request);
            if (!response.getExitoso()) {
                log.warn("Error liberando stock: {}", response.getMensaje());
            }
            log.info("Stock liberado para SKU: {}, cantidad: {}, pedidoId: {}", sku, cantidad, pedidoId);
        } catch (StatusRuntimeException e) {
            log.error("Error gRPC al liberar stock para SKU: {}: {}", sku, e.getMessage());
        } catch (Exception e) {
            log.error("Error inesperado al liberar stock: {}", e.getMessage(), e);
        }
    }

    public void liberarStockFallback(String sku, Integer cantidad, String pedidoId, Exception ex) {
        log.warn("Fallback para liberarStock: {}", ex.getMessage());
    }
}
