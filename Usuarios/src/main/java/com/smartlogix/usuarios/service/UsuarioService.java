package com.smartlogix.usuarios.service;

import com.smartlogix.usuarios.dto.LoginRequest;
import com.smartlogix.usuarios.dto.LoginResponse;
import com.smartlogix.usuarios.dto.UsuarioRequest;
import com.smartlogix.usuarios.dto.UsuarioResponse;
import com.smartlogix.usuarios.model.Rol;
import java.util.List;

public interface UsuarioService {

    UsuarioResponse agregarUsuario(UsuarioRequest request);

    void eliminarUsuario(Long id);

    void desactivarUsuario(Long id);

    UsuarioResponse actualizarUsuario(Long id, UsuarioRequest request);

    List<UsuarioResponse> listarUsuarios();

    UsuarioResponse listarUsuario(Long id);

    List<UsuarioResponse> listarUsuarioPorRol(Rol rol);

    LoginResponse login(LoginRequest request);
}
