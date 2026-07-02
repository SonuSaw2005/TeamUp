import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('teamup_token'));
  const [loading, setLoading] = useState(true);

  // Sync session changes from api response errors
  useEffect(() => {
    const handleAuthChange = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth_change', handleAuthChange);
    return () => window.removeEventListener('auth_change', handleAuthChange);
  }, []);

  // Fetch current user details if token is available
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await API.get('/api/users/profile');
          setUser(res.data);
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post('/api/auth/login', { email, password });
    const { token, user: userProfile } = res.data;
    localStorage.setItem('teamup_token', token);
    setToken(token);
    setUser(userProfile);
    return userProfile;
  };

  const register = async (userData) => {
    return await API.post('/api/auth/register', userData);
  };

  const logout = () => {
    localStorage.removeItem('teamup_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await API.put('/api/users/profile', profileData);
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
