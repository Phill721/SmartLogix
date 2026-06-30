import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('smartlogix_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('smartlogix_token');
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('smartlogix_token');
  });

  const login = async (emailInput, contrasenaInput) => {
    try {
      const response = await fetch('/api/bff/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, contrasena: contrasenaInput }),
      });

      if (!response.ok) throw new Error('Credenciales rechazadas por la bodega central.');

      const data = await response.json();
      const usuarioFormateado = {
        nombre: data.nombre,
        email: emailInput,
        rol: data.rol,
        permisos: data.permisos || [],
      };

      localStorage.setItem('smartlogix_token', data.token);
      localStorage.setItem('smartlogix_user', JSON.stringify(usuarioFormateado));

      setUser(usuarioFormateado);
      setToken(data.token);
      setIsAuthenticated(true);
      return usuarioFormateado;
    } catch (error) {
      console.error('Auth Error:', error.message);
      throw error;
    }
  };

  const register = async (nombre, email, password) => {
    try {
      const response = await fetch('/api/bff/usuarios/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre,
          email: email,
          contrasena: password,
          rol: 'USUARIO'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Rechazo del servidor (${response.status})`);
      }

      return true;
    } catch (error) {
      console.error('Register Error:', error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('smartlogix_token');
    localStorage.removeItem('smartlogix_user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}