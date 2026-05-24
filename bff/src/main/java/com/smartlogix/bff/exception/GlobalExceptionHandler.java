package com.smartlogix.bff.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiClientException.class)
    public ResponseEntity<String> handleApiClientException(
            ApiClientException ex
    ) {

        return ResponseEntity
                .status(ex.getStatusCode())
                .body(ex.getResponseBody());
    }
}