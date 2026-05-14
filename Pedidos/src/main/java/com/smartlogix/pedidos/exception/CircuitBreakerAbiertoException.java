package com.smartlogix.pedidos.exception;

public class CircuitBreakerAbiertoException extends RuntimeException {
    public CircuitBreakerAbiertoException(String message) {
        super(message);
    }
}
