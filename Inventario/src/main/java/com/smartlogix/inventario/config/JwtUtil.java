package com.smartlogix.inventario.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret:tu_clave_secreta_super_fakin_segura}")
    private String secret;

    private SecretKey getSigningKey() {
        byte[] keyBytes = this.secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    public Boolean validateToken(String token, String username) {
        final String tokenUsername = extractUsername(token);
        return (tokenUsername.equals(username) && !isTokenExpired(token));
    }

    public Collection<? extends GrantedAuthority> extractAuthorities(String token) {
        Claims claims = extractAllClaims(token);
        List<GrantedAuthority> authorities = new ArrayList<>();

        // 1. Extraer el Rol ("rol" o "role" según el micro de Usuarios)
        String rol = claims.get("rol", String.class);
        if (rol == null) {
            rol = claims.get("role", String.class);
        }
        if (rol != null && !rol.isEmpty()) {
            // Se le antepone "ROLE_" para cumplir con el estándar estricto de Spring
            // Security
            authorities.add(new SimpleGrantedAuthority("ROLE_" + rol));
        }

        // 2. Extraer la lista nativa de permisos ("permisos" que viene como Array en el
        // JSON)
        Object permisosObj = claims.get("permisos");
        if (permisosObj instanceof List<?> listaPermisos) {
            for (Object p : listaPermisos) {
                if (p != null) {
                    authorities.add(new SimpleGrantedAuthority(p.toString()));
                }
            }
        }

        return authorities;
    }
}