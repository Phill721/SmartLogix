package com.smartlogix.usuarios.repository;

import com.smartlogix.usuarios.model.Rol;
import com.smartlogix.usuarios.model.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByNombre(String nombre);

    Optional<Usuario> findByEmail(String email);

    List<Usuario> findByRol(Rol rol);

    boolean existsByNombre(String nombre);

    boolean existsByEmail(String email);
}
