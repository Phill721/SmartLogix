package com.smartlogix.pedidos.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtUtil {

    @Value("${jwt.secret:smartlogix-secret-key-hmac-sha256}")
    private String secretKey;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public Long extractUsuarioId(String token) {
        try {
            Claims claims = (Claims) Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parse(token)
                    .getBody();

            Object usuarioId = claims.get("usuarioId");
            if (usuarioId != null) {
                return Long.parseLong(usuarioId.toString());
            }
            return null;
        } catch (Exception e) {
            log.error("Error extrayendo usuarioId del token: {}", e.getMessage());
            return null;
        }
    }

    public String extractUsername(String token) {
        try {
            Claims claims = (Claims) Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parse(token)
                    .getBody();
            return claims.getSubject();
        } catch (Exception e) {
            log.error("Error extrayendo username del token: {}", e.getMessage());
            return null;
        }
    }

    public String extractRol(String token) {
        try {
            Claims claims = (Claims) Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parse(token)
                    .getBody();
            Object rol = claims.get("rol");
            return rol != null ? rol.toString() : null;
        } catch (Exception e) {
            log.error("Error extrayendo rol del token: {}", e.getMessage());
            return null;
        }
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parse(token);
            return true;
        } catch (Exception e) {
            log.error("Token inválido: {}", e.getMessage());
            return false;
        }
    }
}