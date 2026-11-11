import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './i18n';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Remplace cette chaîne par ton propre Client ID Google quand il sera créé dans Google Cloud Console
const GOOGLE_CLIENT_ID = "469011736457-ag3c9pm0n1joallf06acb0hp0ie6c9cl.apps.googleusercontent.com";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals();