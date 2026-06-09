package com.smartlogix.usuarios.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class JwtFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private FilterChain filterChain;

    @AfterEach
    void cleanContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_sinAuthorizationDebeContinuarSinAutenticar() throws Exception {
        JwtFilter filter = new JwtFilter(jwtUtil);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_conTokenInvalidoNoDebeAutenticar() throws Exception {
        JwtFilter filter = new JwtFilter(jwtUtil);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer bad-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtUtil.validarToken("bad-token")).thenReturn(false);

        filter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_conTokenValidoDebeConfigurarAutenticacionConRolYPermisos() throws Exception {
        JwtFilter filter = new JwtFilter(jwtUtil);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-ok");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtUtil.validarToken("token-ok")).thenReturn(true);
        when(jwtUtil.extraerNombre("token-ok")).thenReturn("juan");
        when(jwtUtil.extraerRol("token-ok")).thenReturn("ADMINISTRADOR");
        when(jwtUtil.extraerPermiso("token-ok")).thenReturn("ADMINISTRACION");
        when(jwtUtil.extraerPermisos("token-ok")).thenReturn(java.util.List.of("ADMINISTRACION", "VENTAS"));

        filter.doFilterInternal(request, response, filterChain);

        var auth = SecurityContextHolder.getContext().getAuthentication();
        assertEquals("juan", auth.getName());
        assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR")));
        assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ADMINISTRACION")));
        assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("VENTAS")));
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_conPermisoUnicoDebeAplicarFallback() throws Exception {
        JwtFilter filter = new JwtFilter(jwtUtil);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-fallback");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtUtil.validarToken("token-fallback")).thenReturn(true);
        when(jwtUtil.extraerNombre("token-fallback")).thenReturn("ana");
        when(jwtUtil.extraerRol("token-fallback")).thenReturn("USUARIO");
        when(jwtUtil.extraerPermiso("token-fallback")).thenReturn("VISTA_TIENDA");
        when(jwtUtil.extraerPermisos("token-fallback")).thenReturn(java.util.List.of());

        filter.doFilterInternal(request, response, filterChain);

        var auth = SecurityContextHolder.getContext().getAuthentication();
        assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("VISTA_TIENDA")));
    }

    @Test
    void doFilterInternal_siYaHayAutenticacionNoDebeSobrescribir() throws Exception {
        JwtFilter filter = new JwtFilter(jwtUtil);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("existente", null, java.util.List.of())
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-ok");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtUtil.validarToken("token-ok")).thenReturn(true);

        filter.doFilterInternal(request, response, filterChain);

        assertEquals("existente", SecurityContextHolder.getContext().getAuthentication().getName());
        verify(filterChain).doFilter(request, response);
    }
}
