import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user } = useAuth();

  // 1. Récupération de sécurité depuis le localStorage si l'état AuthContext charge encore
  const storedUser = user || JSON.parse(localStorage.getItem('user'));
  const storedToken = localStorage.getItem('token');

  // 2. Si l'utilisateur n'est pas connecté -> Redirection vers /login
  if (!isAuthenticated && !storedToken) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si des rôles spécifiques sont requis et que l'utilisateur n'a pas le bon rôle
  if (allowedRoles && storedUser && !allowedRoles.includes(storedUser.role)) {
    // Redirection selon son rôle réel s'il tente d'accéder à une zone interdite
    return storedUser.role === 'admin' 
      ? <Navigate to="/admin/dashboard" replace />
      : <Navigate to="/student/dashboard" replace />;
  }

  // 4. Si tout est valide, afficher les enfants ou les routes imbriquées (Outlet)
  return children ? children : <Outlet />;
};

export default ProtectedRoute;