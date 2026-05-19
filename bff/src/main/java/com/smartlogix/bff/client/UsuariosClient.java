package com.smartlogix.bff.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.smartlogix.bff.dto.LoginRequestDTO;
import com.smartlogix.bff.dto.LoginResponseDTO;
import com.smartlogix.bff.dto.PageResponseDTO;
import com.smartlogix.bff.dto.UsuarioRequestDTO;
import com.smartlogix.bff.dto.UsuarioResponseDTO;

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

    public UsuarioResponseDTO registrarUsuario(
            UsuarioRequestDTO request
    ) {

        return restClient.post()
                .uri("/api/usuarios/register")
                .body(request)
                .retrieve()
                .body(UsuarioResponseDTO.class);
    }

     public PageResponseDTO<UsuarioResponseDTO> listarUsuarios(
            String token,
            int page,
            int size
    ) {

        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/usuarios")
                        .queryParam("page", page)
                        .queryParam("size", size)
                        .build()
                )
                .header("Authorization", token)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public UsuarioResponseDTO obtenerUsuario(
            String token,
            Long id
    ) {

        return restClient.get()
                .uri("/api/usuarios/{id}", id)
                .header("Authorization", token)
                .retrieve()
                .body(UsuarioResponseDTO.class);
    }

    public UsuarioResponseDTO actualizarUsuario(
            String token,
            Long id,
            UsuarioRequestDTO request
    ) {

        return restClient.put()
                .uri("/api/usuarios/{id}", id)
                .header("Authorization", token)
                .body(request)
                .retrieve()
                .body(UsuarioResponseDTO.class);
    }

    public void eliminarUsuario(
            String token,
            Long id
    ) {

        restClient.delete()
                .uri("/api/usuarios/{id}", id)
                .header("Authorization", token)
                .retrieve()
                .toBodilessEntity();
    }

    public void desactivarUsuario(
            String token,
            Long id
    ) {

        restClient.patch()
                .uri("/api/usuarios/{id}/desactivar", id)
                .header("Authorization", token)
                .retrieve()
                .toBodilessEntity();
    }

    public void desbloquearUsuario(
            String token,
            Long id
    ) {

        restClient.patch()
                .uri("/api/usuarios/{id}/desbloquear", id)
                .header("Authorization", token)
                .retrieve()
                .toBodilessEntity();
    }
}