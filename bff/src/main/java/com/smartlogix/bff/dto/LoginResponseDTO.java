package com.smartlogix.bff.dto;

import java.util.List;

import lombok.Data;

@Data
public class LoginResponseDTO {

    private String token;

    private String nombre;

    private String rol;

    private String permiso;

    private List<String> permisos;
}