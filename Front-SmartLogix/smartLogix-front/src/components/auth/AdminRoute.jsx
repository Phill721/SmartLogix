import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated } = useAuth();

  // Si no está logueado o el rol NO es administrador, lo rebotamos al inicio
  if (!isAuthenticated || user?.rol !== 'ADMINISTRADOR') {
    console.warn('SmartLogix Security: Intento de acceso no autorizado detectado.');
    return <Navigate to="/" replace />;
  }

  // Si pasa la aduana, renderiza la página de administración
  return children;
}