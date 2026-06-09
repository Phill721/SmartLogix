package com.smartlogix.pedidos.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;

import static org.junit.jupiter.api.Assertions.*;

public class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        // aseguramos la misma clave usada por JwtUtil por defecto
        ReflectionTestUtils.setField(jwtUtil, "secretKey", "smartlogix-secret-key-hmac-sha256");
    }

    @Test
    void tokenValido_extraeCampos() {
        String secret = (String) ReflectionTestUtils.getField(jwtUtil, "secretKey");
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());

        String token = Jwts.builder()
                .setSubject("usuario_test")
                .claim("usuarioId", 123L)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        assertTrue(jwtUtil.isTokenValid(token));
        assertEquals("usuario_test", jwtUtil.extractUsername(token));
        assertEquals(123L, jwtUtil.extractUsuarioId(token));
    }

    @Test
    void tokenInvalido_devuelveNulosYFalse() {
        String bad = "no-es-un-token-valido";

        assertFalse(jwtUtil.isTokenValid(bad));
        assertNull(jwtUtil.extractUsername(bad));
        assertNull(jwtUtil.extractUsuarioId(bad));
    }
}
