import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMe } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem('prinsgo_token');
      if (storedToken) {
        setToken(storedToken);
        const res = await getMe();
        setUser(res.user);
      }
    } catch (error) {
      // Token invalid/expired - clear it
      await AsyncStorage.removeItem('prinsgo_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = async (newToken, newUser) => {
    await AsyncStorage.setItem('prinsgo_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('prinsgo_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await getMe();
    setUser(res.user);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
