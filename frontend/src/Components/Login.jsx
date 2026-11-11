import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext'; 
import AnimatedBackground from './AnimatedBackground';
import GoogleAuthButton from './GoogleAuthButton';

function Login() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await loginUser(formData);
      
      localStorage.setItem('token', response.access_token);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      login(response.access_token, response.user);

      const userRole = response.user?.role;
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }

    } catch (error) {
      setErrorMessage(
        error.response?.data?.detail || t('invalid_credentials', 'Identifiants incorrects.')
      );
    } finally {
      setLoading(false);
    }
  };

  const isRTL = i18n.language === 'ar';

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Arrière-plan 3D */}
      <AnimatedBackground />

      {/* Navbar supérieure avec le sélecteur de langue */}
      <nav className="top-navbar" style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 2rem', position: 'relative', zIndex: 10 }}>
        <div className="lang-selector">
          <select value={i18n.language} onChange={handleLanguageChange}>
            <option value="fr">🇫🇷 Français</option>
            <option value="en">🇬🇧 English</option>
            <option value="ar">🇩🇿 العربية</option>
          </select>
        </div>
      </nav>

      {/* Formulaire centré */}
      <div className="auth-wrapper" style={{ minHeight: 'calc(100vh - 100px)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div className="auth-card">
          <div className="auth-header">
            <h1>IACADEMIE</h1>
            <p>{t('login_subtitle', 'Connectez-vous à votre espace')}</p>
          </div>

          {errorMessage && <div className="alert-error">{errorMessage}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('email', 'Adresse Email')}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="exemple@domaine.com"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>{t('password', 'Mot de passe')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    [isRTL ? 'left' : 'right']: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? t('connecting', 'Connexion...') : t('submit_login', 'Se connecter')}
            </button>
          </form>

          {/* Séparateur visuel */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ flex: 1, borderBottom: '1px solid #e5e7eb' }}></div>
            <span style={{ padding: '0 10px', color: '#6b7280', fontSize: '12px' }}>
              {t('or', 'OU')}
            </span>
            <div style={{ flex: 1, borderBottom: '1px solid #e5e7eb' }}></div>
          </div>

          {/* Bouton Google Login / Register */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleAuthButton />
          </div>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
            {t('dont_have_account', "Vous n'avez pas de compte ?")}{' '}
            <Link to="/register" style={{ color: '#7c3aed', fontWeight: '600', textDecoration: 'none' }}>
              {t('submit_register', "S'inscrire")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;