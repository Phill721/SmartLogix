package com.smartlogix.Productos.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private static final String SECRET = "01234567890123456789012345678901";
    private final JwtUtil jwtUtil = new JwtUtil(SECRET);
    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    @Test
    void deberiaValidarTokenValidoYExtraerClaims() {
        String token = Jwts.builder()
                .setSubject("usuario")
                .claim("rol", "ADMINISTRADOR")
                .setExpiration(new Date(new Date().getTime() + 60000))
                .signWith(key)
                .compact();

        assertTrue(jwtUtil.validarToken(token));
        assertEquals("usuario", jwtUtil.extraerNombre(token));
        assertEquals("ADMINISTRADOR", jwtUtil.extraerRol(token));
    }

    @Test
    void deberiaRetornarFalseParaTokenInvalido() {
        assertFalse(jwtUtil.validarToken("token-invalido"));
    }

    @Test
    void deberiaRetornarFalseParaTokenExpirado() {
        String token = Jwts.builder()
                .setSubject("usuario")
                .claim("rol", "ADMINISTRADOR")
                .setExpiration(new Date(new Date().getTime() - 1000))
                .signWith(key)
                .compact();

        assertFalse(jwtUtil.validarToken(token));
    }
}
