package com.smartlogix.usuarios.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            // Rechazar tokens manipulados con header inválido (por ejemplo alg=none)
            try {
                String[] parts = token.split("\\.");
                if (parts.length != 3) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token inválido");
                    return;
                }
                String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
                if (!headerJson.contains("\"alg\":\"HS256\"")) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Algoritmo de firma no permitido");
                    return;
                }
            } catch (IllegalArgumentException e) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token inválido");
                return;
            }

            if (jwtUtil.validarToken(token) && SecurityContextHolder.getContext().getAuthentication() == null) {
                String nombre = jwtUtil.extraerNombre(token);
                String rol = jwtUtil.extraerRol(token);
                String permiso = jwtUtil.extraerPermiso(token);
                List<String> permisos = new ArrayList<>(jwtUtil.extraerPermisos(token));
                if (permiso != null && permisos.isEmpty()) {
                    permisos.add(permiso);
                }
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                if (rol != null) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + rol));
                }
                for (String permisoActual : permisos) {
                    authorities.add(new SimpleGrantedAuthority(permisoActual));
                }
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        nombre,
                        null,
                        authorities
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}
