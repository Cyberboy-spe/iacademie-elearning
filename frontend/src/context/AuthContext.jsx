import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Création du contexte d'authentification
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérification du jeton au chargement initial de l'application
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Optionnel : Récupérer les infos utilisateur depuis le backend si besoin
    }
    setLoading(false);
  }, []);

  // Fonction de connexion : sauvegarde le jeton et met à jour l'état
  const login = (newToken, userData = null) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  // Fonction de déconnexion : supprime le jeton
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser facilement l'AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};