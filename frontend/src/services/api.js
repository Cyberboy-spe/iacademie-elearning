import axios from 'axios';


const API_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour inclure le token JWT dans chaque requête sortante
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = async (userData) => {
  // Attendu par FastAPI : { full_name, email, password }
  const response = await api.post('/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  
  const response = await api.post('/login', credentials);
  if (response.data.access_token) {
    // Sauvegarde du token JWT dans le navigateur
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export default api;