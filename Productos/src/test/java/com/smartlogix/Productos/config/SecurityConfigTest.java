package com.smartlogix.Productos.config;

import com.smartlogix.Productos.security.JwtFilter;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

class SecurityConfigTest {

    @SuppressWarnings("unchecked")
    @Test
    void deberiaCrearSecurityFilterChainConJwtFilter() throws Exception {
        HttpSecurity httpSecurity = mock(HttpSecurity.class);
        DefaultSecurityFilterChain chain = mock(DefaultSecurityFilterChain.class);

        when(httpSecurity.csrf(any(Customizer.class))).thenReturn(httpSecurity);
        when(httpSecurity.sessionManagement(any(Customizer.class))).thenReturn(httpSecurity);
        when(httpSecurity.authorizeHttpRequests(any(Customizer.class))).thenReturn(httpSecurity);
        when(httpSecurity.addFilterBefore(any(OncePerRequestFilter.class), eq(UsernamePasswordAuthenticationFilter.class)))
                .thenReturn(httpSecurity);
        when(httpSecurity.build()).thenReturn(chain);

        when(httpSecurity.addFilterBefore(any(OncePerRequestFilter.class), eq(UsernamePasswordAuthenticationFilter.class)))
                .thenReturn(httpSecurity);
        when(httpSecurity.build()).thenReturn(chain);

        SecurityConfig config = new SecurityConfig(mock(JwtFilter.class));
        var result = config.securityFilterChain(httpSecurity);

        assertSame(chain, result);
        verify(httpSecurity).csrf(any(Customizer.class));
        verify(httpSecurity).sessionManagement(any(Customizer.class));
        verify(httpSecurity).authorizeHttpRequests(any(Customizer.class));
        verify(httpSecurity).addFilterBefore(any(OncePerRequestFilter.class), eq(UsernamePasswordAuthenticationFilter.class));
        verify(httpSecurity).build();
    }

    @Test
    void deberiaTenerAnotacionesDeConfiguracion() {
        assertTrue(SecurityConfig.class.isAnnotationPresent(org.springframework.context.annotation.Configuration.class));
        assertTrue(SecurityConfig.class.isAnnotationPresent(org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity.class));
    }
}
