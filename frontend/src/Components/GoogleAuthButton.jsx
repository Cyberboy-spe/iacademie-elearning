import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 

const GoogleAuthButton = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('http://localhost:8000/auth/google', {
        token: credentialResponse.credential
      });

      // Stocker les données dans le localStorage
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Mettre à jour le contexte global
      if (login) {
        login(res.data.access_token, res.data.user);
      }

      // Redirection dynamique selon le rôle
      const userRole = res.data.user?.role;
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }

    } catch (error) {
      console.error('Erreur lors de la connexion/inscription Google :', error);
    }
  };

  return (
    <div className="flex justify-center my-4">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.log('Échec de la connexion Google')}
        text="continue_with"
        shape="rectangular"
      />
    </div>
  );
};

export default GoogleAuthButton;