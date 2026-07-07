import axios from 'axios';

const API = axios.create({
  baseURL: 'https://teamup-production-c57b.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('teamup_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle expired tokens
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('teamup_token');
      localStorage.removeItem('teamup_user');
      window.dispatchEvent(new Event('auth_change'));
    }
    return Promise.reject(error);
  }
);

export default API;
