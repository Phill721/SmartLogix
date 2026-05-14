package com.smartlogix.Productos.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private final Key key;

    public JwtUtil(
            @Value("${jwt.secret}") String secret
    ) {

        this.key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    public Claims extraerClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validarToken(String token) {

        try {

            Claims claims = extraerClaims(token);

            return claims.getExpiration()
                    .after(new Date());

        } catch (Exception ex) {

            return false;
        }
    }

    public String extraerNombre(String token) {

        return extraerClaims(token)
                .getSubject();
    }

    public String extraerRol(String token) {

        Object rol = extraerClaims(token)
                .get("rol");

        return rol != null
                ? rol.toString()
                : null;
    }
}