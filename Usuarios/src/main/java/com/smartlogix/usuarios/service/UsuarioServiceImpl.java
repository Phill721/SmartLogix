package com.smartlogix.usuarios.service;

import com.smartlogix.usuarios.dto.LoginRequest;
import com.smartlogix.usuarios.dto.LoginResponse;
import com.smartlogix.usuarios.dto.UsuarioRequest;
import com.smartlogix.usuarios.dto.UsuarioResponse;
import com.smartlogix.usuarios.events.UsuarioEvent;
import com.smartlogix.usuarios.exception.ResourceNotFoundException;
import com.smartlogix.usuarios.exception.UsuarioYaExisteException;
import com.smartlogix.usuarios.model.Rol;
import com.smartlogix.usuarios.model.Usuario;
import com.smartlogix.usuarios.repository.UsuarioRepository;
import com.smartlogix.usuarios.security.JwtUtil;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;
    private final JwtUtil jwtUtil;

    @Override
    public UsuarioResponse agregarUsuario(UsuarioRequest request) {
        if (usuarioRepository.existsByNombre(request.getNombre())) {
            throw new UsuarioYaExisteException("El nombre de usuario ya existe: " + request.getNombre());
        }

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .contrasena(passwordEncoder.encode(request.getContrasena()))
                .rol(request.getRol())
                .build();

        Usuario guardado = usuarioRepository.save(usuario);
        publicarEvento("CREAR", "Usuario creado con ID: " + guardado.getId());
        return toResponse(guardado);
    }

    @Override
    public void eliminarUsuario(Long id) {
        Usuario usuario = obtenerUsuarioPorId(id);
        usuarioRepository.delete(usuario);
        publicarEvento("ELIMINAR", "Usuario eliminado con ID: " + id);
    }

    @Override
    public UsuarioResponse actualizarUsuario(Long id, UsuarioRequest request) {
        Usuario usuario = obtenerUsuarioPorId(id);

        if (!usuario.getNombre().equals(request.getNombre()) && usuarioRepository.existsByNombre(request.getNombre())) {
            throw new UsuarioYaExisteException("El nombre de usuario ya existe: " + request.getNombre());
        }

        usuario.setNombre(request.getNombre());
        usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        usuario.setRol(request.getRol());

        Usuario actualizado = usuarioRepository.save(usuario);
        publicarEvento("ACTUALIZAR", "Usuario actualizado con ID: " + actualizado.getId());
        return toResponse(actualizado);
    }

    @Override
    public List<UsuarioResponse> listarUsuarios() {
        List<UsuarioResponse> usuarios = usuarioRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
        publicarEvento("CONSULTAR", "Listado completo de usuarios");
        return usuarios;
    }

    @Override
    public UsuarioResponse listarUsuario(Long id) {
        Usuario usuario = obtenerUsuarioPorId(id);
        publicarEvento("CONSULTAR", "Consulta de usuario con ID: " + id);
        return toResponse(usuario);
    }

    @Override
    public List<UsuarioResponse> listarUsuarioPorRol(Rol rol) {
        List<UsuarioResponse> usuarios = usuarioRepository.findByRol(rol)
                .stream()
                .map(this::toResponse)
                .toList();
        publicarEvento("CONSULTAR", "Consulta de usuarios por rol: " + rol);
        return usuarios;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByNombre(request.getNombre())
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getContrasena(), usuario.getContrasena())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        String token = jwtUtil.generarToken(usuario.getNombre(), usuario.getRol().name());
        return LoginResponse.builder()
                .token(token)
                .nombre(usuario.getNombre())
                .rol(usuario.getRol())
                .build();
    }

    private Usuario obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return UsuarioResponse.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .rol(usuario.getRol())
                .build();
    }

    private void publicarEvento(String tipoOperacion, String mensaje) {
        eventPublisher.publishEvent(UsuarioEvent.builder()
                .tipoOperacion(tipoOperacion)
                .mensaje(mensaje)
                .timestamp(LocalDateTime.now())
                .build());
    }
}
