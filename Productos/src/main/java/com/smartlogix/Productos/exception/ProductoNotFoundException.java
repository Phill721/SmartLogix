package com.smartlogix.Productos.exception;

public class ProductoNotFoundException extends RuntimeException {

    public ProductoNotFoundException(String mensaje) {
        super(mensaje);
    }
}