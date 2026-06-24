import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('smartlogix_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('smartlogix_token');
  });

  const login = async (email, password) => {
    // Simulamos el tiempo de respuesta de tu futuro backend en Spring Boot (600ms)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (password === '123456') {
          const mockUser = {
            id: 1042,
            nombre: email.split('@')[0].replace('.', ' '),
            email: email,
            rol: email.includes('admin') ? 'ADMINISTRADOR' : 'OPERADOR_LOGÍSTICO',
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`
          };
          
          const fakeJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.smartlogix_simulated_jwt_2026';

          localStorage.setItem('smartlogix_token', fakeJwtToken);
          localStorage.setItem('smartlogix_user', JSON.stringify(mockUser));

          setUser(mockUser);
          setIsAuthenticated(true);
          resolve(mockUser);
        } else {
          reject(new Error('Credenciales incorrectas. (Tip de testeo: la clave es "123456")'));
        }
      }, 600);
    });
  };

  const register = async (nombre, email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: Math.floor(Math.random() * 9000) + 1000,
          nombre: nombre,
          email: email,
          rol: 'CLIENTE_RETAIL',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`
        };
        const fakeJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.smartlogix_new_jwt';

        localStorage.setItem('smartlogix_token', fakeJwtToken);
        localStorage.setItem('smartlogix_user', JSON.stringify(newUser));

        setUser(newUser);
        setIsAuthenticated(true);
        resolve(newUser);
      }, 600);
    });
  };

  const logout = () => {
    localStorage.removeItem('smartlogix_token');
    localStorage.removeItem('smartlogix_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}