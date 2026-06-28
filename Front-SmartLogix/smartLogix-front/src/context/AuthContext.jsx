import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('smartlogix_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('smartlogix_token');
  });

  // CONECTADO ESTRICTAMENTE A TU POSTMAN EXITOSO (llaves: email, contrasena)
  const login = async (emailInput, contrasenaInput) => {
    try {
      const response = await fetch('/api/bff/usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // CAMBIO QUIRÚRGICO: Enviamos exactamente la llave "email" que exige Java
        body: JSON.stringify({ 
          email: emailInput, 
          contrasena: contrasenaInput 
        }), 
      });

      if (!response.ok) {
        throw new Error('Credenciales rechazadas por el servidor de identidad.');
      }

      const data = await response.json(); // Recibe tu LoginResponseDTO

      const usuarioFormateado = {
        nombre: data.nombre,
        email: emailInput, // Lo guardamos aquí para que tu UI pueda mostrarlo
        rol: data.rol, // "ADMINISTRADOR" | "VENDEDOR" | "USUARIO"
        permisos: data.permisos || [data.permiso].filter(Boolean),
      };

      localStorage.setItem('smartlogix_token', data.token);
      localStorage.setItem('smartlogix_user', JSON.stringify(usuarioFormateado));

      setUser(usuarioFormateado);
      setIsAuthenticated(true);
      return usuarioFormateado;
    } catch (error) {
      console.error('Auth Error:', error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('smartlogix_token');
    localStorage.removeItem('smartlogix_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}