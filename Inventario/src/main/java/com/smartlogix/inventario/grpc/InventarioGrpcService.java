package com.smartlogix.inventario.grpc;

import com.smartlogix.inventario.entity.Inventario;
import com.smartlogix.inventario.exception.StockInsuficienteException;
import com.smartlogix.inventario.service.InventarioService;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import lombok.RequiredArgsConstructor;

@GrpcService
@RequiredArgsConstructor
public class InventarioGrpcService extends ServicioInventarioGrpc.ServicioInventarioImplBase {

    private final InventarioService service;

    @Override
    public void checkStock(StockRequest request, StreamObserver<StockResponse> responseObserver) {
        try {
            Inventario inv = service.obtenerPorSku(request.getSku());

            StockResponse response = StockResponse.newBuilder()
                    .setSku(inv.getSku())
                    .setStockTotal(inv.getStockTotal())
                    .setStockReservado(inv.getStockReservado())
                    .setStockDisponible(inv.getStockDisponible())
                    .setEstaDisponible(inv.getStockDisponible() > 0)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void reserveStock(ReserveRequest request, StreamObserver<ReserveResponse> responseObserver) {
        try {
            service.reservarStock(request.getSku(), request.getCantidad(), "grpc-reserva");
            ReserveResponse response = ReserveResponse.newBuilder()
                    .setExito(true)
                    .setMensaje("Reserva de stock exitosa")
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (StockInsuficienteException e) {
            responseObserver.onError(Status.FAILED_PRECONDITION
                    .withDescription(e.getMessage())
                    .asRuntimeException());
        } catch (Exception e) {
            responseObserver.onError(Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }
}
