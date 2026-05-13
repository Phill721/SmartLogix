package com.smartlogix.bff.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartlogix.bff.client.UsuariosClient;
import com.smartlogix.bff.dto.LoginRequestDTO;
import com.smartlogix.bff.dto.LoginResponseDTO;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuariosClient usuariosClient;

    public AuthController(
            UsuariosClient usuariosClient
    ) {
        this.usuariosClient = usuariosClient;
    }

    @PostMapping("/login")
    public LoginResponseDTO login(
            @RequestBody LoginRequestDTO request
    ) {

        return usuariosClient.login(request);
    }
}