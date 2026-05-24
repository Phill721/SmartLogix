package com.smartlogix.bff.exception;

import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public class ApiClientException extends RuntimeException {

    private final HttpStatusCode statusCode;

    private final String responseBody;

    public ApiClientException(
            HttpStatusCode statusCode,
            String responseBody
    ) {

        super(responseBody);
        this.statusCode = statusCode;
        this.responseBody = responseBody;
    }
}