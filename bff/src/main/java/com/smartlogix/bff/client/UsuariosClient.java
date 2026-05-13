package com.smartlogix.bff.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.smartlogix.bff.dto.LoginRequestDTO;
import com.smartlogix.bff.dto.LoginResponseDTO;

@FeignClient(
        name = "usuarios-client",
        url = "${usuarios.url}"
)
public interface UsuariosClient {

    @PostMapping("/api/usuarios/login")
    LoginResponseDTO login(
            @RequestBody LoginRequestDTO request
    );
}