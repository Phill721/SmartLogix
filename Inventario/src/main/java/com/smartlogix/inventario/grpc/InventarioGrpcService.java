package com.smartlogix.inventario.grpc;

import com.smartlogix.inventario.entity.Inventario;
import com.smartlogix.inventario.service.InventarioService;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@GrpcService
@RequiredArgsConstructor
public class InventarioGrpcService extends ServicioInventarioGrpc.ServicioInventarioImplBase {

    private final InventarioService inventarioService;

    @Override
    public void checkStock(StockRequest request, StreamObserver<StockResponse> responseObserver) {
        try {
            Inventario inv = inventarioService.obtenerPorSku(request.getSku());
            StockResponse response = StockResponse.newBuilder()
                    .setSku(inv.getSku())
                    .setStockDisponible(inv.getStockDisponible())
                    .setEstaDisponible(inv.getStockDisponible() > 0)
                    .build();
            responseObserver.onNext(response);
        } catch (Exception e) {
            responseObserver.onNext(StockResponse.newBuilder().setEstaDisponible(false).build());
        }
        responseObserver.onCompleted();
    }

    @Override
    @Transactional
    public void reserveStock(ReserveRequest request, StreamObserver<ReserveResponse> responseObserver) {
        try {
            inventarioService.reservarStock(request.getSku(), request.getCantidad(), request.getPedidoId());
            responseObserver.onNext(ReserveResponse.newBuilder().setExito(true).build());
        } catch (Exception e) {
            responseObserver.onNext(ReserveResponse.newBuilder().setExito(false).setMensaje(e.getMessage()).build());
        }
        responseObserver.onCompleted();
    }

    @Override
    @Transactional
    public void releaseStock(ReleaseRequest request, StreamObserver<ReleaseResponse> responseObserver) {
        try {
            inventarioService.liberarStock(request.getSku(), request.getCantidad(), request.getPedidoId());
            responseObserver.onNext(ReleaseResponse.newBuilder().setExito(true).build());
        } catch (Exception e) {
            responseObserver.onNext(ReleaseResponse.newBuilder().setExito(false).setMensaje(e.getMessage()).build());
        }
        responseObserver.onCompleted();
    }

    @Override
    public void updateStock(UpdateRequest request, StreamObserver<UpdateResponse> responseObserver) {
        try {
            inventarioService.actualizarStock(request.getSku(), request.getNuevaCantidad(), request.getMotivo());
            responseObserver.onNext(UpdateResponse.newBuilder().setExito(true).setStockActual(request.getNuevaCantidad()).build());
        } catch (Exception e) {
            responseObserver.onNext(UpdateResponse.newBuilder().setExito(false).build());
        }
        responseObserver.onCompleted();
    }
}