package com.smartlogix.usuarios.config;

import com.smartlogix.usuarios.model.Rol;
import com.smartlogix.usuarios.model.Usuario;
import com.smartlogix.usuarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class AdminSeedConfig {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedAdminUsuario(
            @Value("${app.seed.admin.nombre:admin}") String adminNombre,
            @Value("${app.seed.admin.contrasena:Admin123*}") String adminContrasena
    ) {
        return args -> {
            if (!usuarioRepository.findByRol(Rol.ADMINISTRADOR).isEmpty()) {
                return;
            }

            if (usuarioRepository.existsByNombre(adminNombre)) {
                log.warn("No se creó el admin por defecto porque el nombre '{}' ya existe con otro rol.", adminNombre);
                return;
            }

            Usuario admin = Usuario.builder()
                    .nombre(adminNombre)
                    .contrasena(passwordEncoder.encode(adminContrasena))
                    .rol(Rol.ADMINISTRADOR)
                    .adminBase(true)
                    .build();

            usuarioRepository.save(admin);
            log.info("Usuario administrador por defecto creado: {}", adminNombre);
        };
    }
}
