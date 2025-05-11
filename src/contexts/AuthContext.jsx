import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_URL;
  
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
  
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
  
      const { token, user } = response.data;
  
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
  
      setCurrentUser(user);
      setLoading(false);
  
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to login');
      setLoading(false);
      return false;
    }
  };
    
  // const register = async (userData) => {
  //   try {
  //     setError(null);
  //     setLoading(true);
  
  //     const response = await axios.post(`${API_URL}/auth/register`, userData);
  
  //     const { token, user } = response.data;
  
  //     localStorage.setItem('token', token);
  //     localStorage.setItem('user', JSON.stringify(user));
  
  //     setCurrentUser(user);
  //     setLoading(false);
  
  //     return true;
  //   } catch (error) {
  //     setError(error.response?.data?.message || 'Failed to register');
  //     setLoading(false);
  //     return false;
  //   }
  // };


  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
  
      const response = await axios.post(`${API_URL}/auth/register`, userData);
  
      setLoading(false);
      return true; // only return success
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to register');
      setLoading(false);
      return false;
    }
  };
  
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };
  
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setCurrentUser(null);
        setLoading(false);
        return false;
      }
      
      // Set default headers for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verify token is valid by making a request to protected route
      const response = await axios.get(`${API_URL}/auth/me`);
      
      if (response.data.success) {
        setCurrentUser(response.data.data); // ✅ Correct
        setLoading(false);
        return true;
      } else {
        logout();
        setLoading(false);
        return false;
      }
    } catch (error) {
      logout();
      setLoading(false);
      return false;
    }
  }, [API_URL]);
  
  useEffect(() => {
    // Check if user is already logged in on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setCurrentUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);
  
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    setError
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}