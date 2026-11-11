import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { registerUser } from '../services/api';
import AnimatedBackground from './AnimatedBackground';
import GoogleAuthButton from './GoogleAuthButton';

function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });

  const [step, setStep] = useState(1); // Étape 1 : Formulaire / Étape 2 : Saisie du code OTP
  const [otpCode, setOtpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_URL = 'http://localhost:8000';

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Étape 1 : Demande d'envoi du code OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    // Vérification de la correspondance des mots de passe
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage(t('passwords_do_not_match', 'Les mots de passe ne correspondent pas.'));
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/send-otp`, {
        email: formData.email
      });
      setInfoMessage(response.data.message || t('code_sent', 'Code de vérification envoyé à votre adresse e-mail.'));
      setStep(2); // Basculer vers la saisie du code
    } catch (error) {
      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setErrorMessage(detail[0]?.msg || t('registration_failed', 'Échec de l’envoi du code.'));
      } else if (typeof detail === 'string') {
        setErrorMessage(detail);
      } else {
        setErrorMessage(t('registration_failed', 'Échec de l’envoi du code.'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Vérification du code OTP + Inscription BDD
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setLoading(true);

    try {
      // 1. Validation de l'OTP auprès de l'API
      await axios.post(`${API_URL}/verify-otp`, {
        email: formData.email,
        code: otpCode
      });

      // 2. Exclure confirmPassword avant l'inscription via le service api.js
      const { confirmPassword, ...dataToSend } = formData;
      await registerUser(dataToSend);

      navigate('/login');
    } catch (error) {
      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setErrorMessage(detail[0]?.msg || t('registration_failed', 'Échec de la vérification.'));
      } else if (typeof detail === 'string') {
        setErrorMessage(detail);
      } else {
        setErrorMessage(t('registration_failed', 'Échec de la vérification.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const isRTL = i18n.language === 'ar';

  return (
    <>
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
      <div className="auth-wrapper" style={{ minHeight: 'calc(100vh - 250px)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div className="auth-card">
          <div className="auth-header">
            <h1>IACADEMIE</h1>
            <p>{step === 1 ? t('register_subtitle', 'Créez votre compte') : t('verify_email_subtitle', 'Vérification de votre e-mail')}</p>
          </div>

          {errorMessage && <div className="alert-error">{errorMessage}</div>}
          {infoMessage && <div className="alert-info" style={{ color: '#059669', marginBottom: '1rem', textAlign: 'center' }}>{infoMessage}</div>}

          {step === 1 ? (
            /* Formulaire d'inscription classique */
            <>
              {/* Bouton Google centralisé */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleAuthButton />
              </div>

              {/* Séparateur visuel */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                <div style={{ flex: 1, borderBottom: '1px solid #e5e7eb' }}></div>
                <span style={{ padding: '0 10px', color: '#6b7280', fontSize: '12px' }}>
                  {t('or', 'OU')}
                </span>
                <div style={{ flex: 1, borderBottom: '1px solid #e5e7eb' }}></div>
              </div>

              <form onSubmit={handleSendOTP}>
                <div className="form-group">
                  <label>{t('full_name', 'Nom complet')}</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="form-input"
                  />
                </div>

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

                {/* Champ : Confirmation du mot de passe */}
                <div className="form-group">
                  <label>{t('confirm_password', 'Confirmer le mot de passe')}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-submit">
                  {loading ? t('sending_code', 'Envoi du code...') : t('send_code_btn', 'Recevoir le code de vérification')}
                </button>
              </form>
            </>
          ) : (
            /* Formulaire de saisie du code de vérification à 6 chiffres */
            <form onSubmit={handleVerifyAndRegister}>
              <div className="form-group">
                <label>{t('enter_otp_label', 'Code de vérification (envoyé par e-mail)')}</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Ex: 123456"
                  required
                  maxLength={6}
                  className="form-input"
                  style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '4px' }}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? t('verifying', 'Vérification...') : t('validate_and_register', 'Valider et créer mon compte')}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  marginTop: '10px',
                  width: '100%',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {t('edit_info', 'Modifier mes informations')}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
            {t('already_have_account', 'Vous avez déjà un compte ?')}{' '}
            <Link to="/login" style={{ color: '#7c3aed', fontWeight: '600', textDecoration: 'none' }}>
              {t('submit_login', 'Se connecter')}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;