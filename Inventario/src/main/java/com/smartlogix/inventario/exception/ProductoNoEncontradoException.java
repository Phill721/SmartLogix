package com.smartlogix.inventario.exception;

public class ProductoNoEncontradoException extends RuntimeException {
    public ProductoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}