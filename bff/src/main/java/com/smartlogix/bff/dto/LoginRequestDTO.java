package com.smartlogix.bff.dto;

import lombok.Data;

@Data
public class LoginRequestDTO {

    private String email;
    private String contrasena;
}