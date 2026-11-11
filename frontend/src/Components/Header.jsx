import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Gestion automatique du sens de lecture LTR / RTL selon la langue choisie
  useEffect(() => {
    const currentLang = i18n.language || 'fr';
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    i18n.changeLanguage(selectedLang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo / Titre : Redirige vers /dashboard si connecté, sinon vers /login */}
        <Link 
          to={isAuthenticated ? "/dashboard" : "/login"} 
          className="text-xl font-bold hover:opacity-90 transition-opacity"
        >
          {t('app_name')}
        </Link>

        {/* Navigation & Sélecteur de Langue */}
        <nav className="flex items-center space-x-4 rtl:space-x-reverse">
          
          {/* Sélecteur de langue (FR / EN / AR) */}
          <select 
            value={i18n.language || 'fr'} 
            onChange={handleLanguageChange}
            className="bg-blue-700 text-white border border-blue-400 text-sm rounded px-2 py-1 outline-none cursor-pointer"
          >
            <option value="fr">🇫🇷 Français</option>
            <option value="en">🇬🇧 English</option>
            <option value="ar">🇩🇿 العربية</option>
          </select>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:underline">{t('dashboard')}</Link>
              <Link to="/formations" className="hover:underline">{t('formations')}</Link>
              <Link to="/courses" className="hover:underline">{t('courses')}</Link>
              
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
              >
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">{t('login')}</Link>
              <Link to="/register" className="bg-white text-blue-600 px-3 py-1 rounded font-semibold hover:bg-gray-100">
                {t('register')}
              </Link>
            </>
          )}
        </nav>

      </div>
    </header>
  );
};

export default Header;