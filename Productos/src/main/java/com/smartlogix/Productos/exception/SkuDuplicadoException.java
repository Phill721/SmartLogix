package com.smartlogix.Productos.exception;

public class SkuDuplicadoException extends RuntimeException {

    public SkuDuplicadoException(String mensaje) {
        super(mensaje);
    }
}