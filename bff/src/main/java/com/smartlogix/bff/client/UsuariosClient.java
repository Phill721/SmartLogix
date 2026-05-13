package com.smartlogix.bff.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.smartlogix.bff.dto.LoginRequestDTO;
import com.smartlogix.bff.dto.LoginResponseDTO;

@Service
public class UsuariosClient {

    private final RestClient restClient;

    public UsuariosClient(
            @Value("${usuarios.url}") String usuariosUrl
    ) {

        this.restClient = RestClient.builder()
                .baseUrl(usuariosUrl)
                .build();
    }

    public LoginResponseDTO login(LoginRequestDTO request) {

        return restClient.post()
                .uri("/api/usuarios/login")
                .body(request)
                .retrieve()
                .body(LoginResponseDTO.class);
    }
}