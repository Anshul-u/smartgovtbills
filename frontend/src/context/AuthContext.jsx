import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Setup axios defaults
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const prodBackend = "https://smartgovtbills-backend.onrender.com/api";
const localBackend = "http://localhost:5000/api";

axios.defaults.baseURL = import.meta.env.VITE_API_URL || (isLocal ? localBackend : prodBackend);

console.log(`[System] API Base URL: ${axios.defaults.baseURL}`);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      setUser(parsed);
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const register = async (userData) => {
    const { data } = await axios.post('/auth/register', userData);
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    delete axios.defaults.headers.common['Authorization'];
  };

  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, isChatOpen, setIsChatOpen }}>
      {children}
    </AuthContext.Provider>
  );
};
