package com.smartlogix.bff.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartlogix.bff.client.UsuariosClient;
import com.smartlogix.bff.dto.LoginRequestDTO;
import com.smartlogix.bff.dto.LoginResponseDTO;
import com.smartlogix.bff.dto.PageResponseDTO;
import com.smartlogix.bff.dto.UsuarioRequestDTO;
import com.smartlogix.bff.dto.UsuarioResponseDTO;

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

     @PostMapping("/register")
    public UsuarioResponseDTO registrar(
            @RequestBody UsuarioRequestDTO request
    ) {

        return usuariosClient.registrarUsuario(request);
    }

    @GetMapping
    public PageResponseDTO<UsuarioResponseDTO> listar(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        return usuariosClient.listarUsuarios(
                token,
                page,
                size
        );
    }

    @GetMapping("/{id}")
    public UsuarioResponseDTO obtener(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {

        return usuariosClient.obtenerUsuario(
                token,
                id
        );
    }

     @PutMapping("/{id}")
    public UsuarioResponseDTO actualizar(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody UsuarioRequestDTO request
    ) {

        return usuariosClient.actualizarUsuario(
                token,
                id,
                request
        );
    }

     @DeleteMapping("/{id}")
    public void eliminar(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {

        usuariosClient.eliminarUsuario(
                token,
                id
        );
    }

    @PatchMapping("/{id}/desactivar")
    public void desactivar(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {

        usuariosClient.desactivarUsuario(
                token,
                id
        );
    }

    @PatchMapping("/{id}/desbloquear")
    public void desbloquear(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {

        usuariosClient.desbloquearUsuario(
                token,
                id
        );
    }

}