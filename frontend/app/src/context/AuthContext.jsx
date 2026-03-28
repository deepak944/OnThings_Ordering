import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

const AuthContext = createContext(null);
const PASSWORD_RESET_STORAGE_KEY = 'localPasswordResetRequests';
const LOCAL_AUTH_FALLBACK_ENABLED = String(import.meta.env.VITE_ENABLE_LOCAL_AUTH_FALLBACK || 'false') === 'true';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [authMode, setAuthMode] = useState('backend');
  const [isLoading, setIsLoading] = useState(true);

  const isConnectionError = (error) => {
    const message = String(error?.message || '').toLowerCase();
    return (
      message.includes('failed to fetch') ||
      message.includes('networkerror') ||
      message.includes('connection refused') ||
      error?.name === 'TypeError'
    );
  };

  const getLocalUsers = () => {
    try {
      return JSON.parse(localStorage.getItem('users') || '[]');
    } catch (_error) {
      return [];
    }
  };

  const setLocalUsers = (users) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  const getLocalResetRequests = () => {
    try {
      return JSON.parse(localStorage.getItem(PASSWORD_RESET_STORAGE_KEY) || '{}');
    } catch (_error) {
      return {};
    }
  };

  const setLocalResetRequests = (requests) => {
    localStorage.setItem(PASSWORD_RESET_STORAGE_KEY, JSON.stringify(requests));
  };

  // Check for existing auth user on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('authUser');
        const storedToken = localStorage.getItem('authToken');
        const storedAuthMode = localStorage.getItem('authMode') || 'backend';

        if (storedAuthMode === 'local' && !LOCAL_AUTH_FALLBACK_ENABLED) {
          localStorage.removeItem('authUser');
          localStorage.removeItem('authToken');
          localStorage.removeItem('authMode');
          setUser(null);
          setToken('');
          setAuthMode('backend');
          return;
        }

        setAuthMode(storedAuthMode);

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);

          if (storedAuthMode === 'backend') {
            try {
              const profileRes = await apiRequest('/auth/profile', { token: storedToken });
              const profile = profileRes?.data;
              if (profile) {
                const sessionUser = {
                  id: profile.id,
                  name: profile.name || profile.full_name,
                  email: profile.email,
                  profile_picture: profile.profile_picture || null
                };
                setUser(sessionUser);
                localStorage.setItem('authUser', JSON.stringify(sessionUser));
              }
            } catch (error) {
              if (!isConnectionError(error)) {
                localStorage.removeItem('authUser');
                localStorage.removeItem('authToken');
                localStorage.removeItem('authMode');
                setUser(null);
                setToken('');
                setAuthMode('backend');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error parsing auth user:', error);
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('authMode');
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to prevent UI flickering
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  const signup = async (userData) => {
    try {
      await apiRequest('/auth/signup', {
        method: 'POST',
        body: {
          full_name: userData.name,
          email: userData.email,
          password: userData.password
        }
      });
      setAuthMode('backend');
      localStorage.setItem('authMode', 'backend');
      return { success: true };
    } catch (error) {
      if (LOCAL_AUTH_FALLBACK_ENABLED && isConnectionError(error)) {
        const users = getLocalUsers();
        const exists = users.find((entry) => entry.email === userData.email);
        if (exists) {
          return { success: false, error: 'Email already registered. Please login.' };
        }

        // NOTE: Plain-text password in localStorage is only for local-dev fallback mode.
        const localUser = {
          id: Date.now().toString(),
          name: userData.name,
          email: userData.email,
          password: userData.password,
          createdAt: new Date().toISOString()
        };

        users.push(localUser);
        setLocalUsers(users);
        setAuthMode('local');
        localStorage.setItem('authMode', 'local');
        return { success: true };
      }
      return { success: false, error: error.message || 'Signup failed. Please try again.' };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      const authUser = response?.data?.user;
      const authToken = response?.data?.token;

      if (!authUser || !authToken) {
        return { success: false, error: 'Invalid login response from server.' };
      }

      const sessionUser = {
        id: authUser.id,
        name: authUser.name || authUser.full_name,
        email: authUser.email,
        profile_picture: authUser.profile_picture || null
      };

      localStorage.setItem('authUser', JSON.stringify(sessionUser));
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('authMode', 'backend');
      setUser(sessionUser);
      setToken(authToken);
      setAuthMode('backend');

      return { success: true };
    } catch (error) {
      if (LOCAL_AUTH_FALLBACK_ENABLED && isConnectionError(error)) {
        const users = getLocalUsers();
        const foundUser = users.find((entry) => entry.email === email && entry.password === password);
        if (!foundUser) {
          return { success: false, error: 'Invalid email or password.' };
        }

        const sessionUser = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email
        };

        localStorage.setItem('authUser', JSON.stringify(sessionUser));
        localStorage.setItem('authToken', 'local-dev-token');
        localStorage.setItem('authMode', 'local');
        setUser(sessionUser);
        setToken('local-dev-token');
        setAuthMode('local');

        return { success: true };
      }
      return { success: false, error: error.message || 'Login failed. Please try again.' };
    }
  };

  const googleLogin = async (idToken) => {
    try {
      const response = await apiRequest('/auth/google', {
        method: 'POST',
        body: { idToken }
      });

      const authUser = response?.data?.user;
      const authToken = response?.data?.token;

      const sessionUser = {
        id: authUser.id,
        name: authUser.name || authUser.full_name,
        email: authUser.email,
        profile_picture: authUser.profile_picture || null
      };

      localStorage.setItem('authUser', JSON.stringify(sessionUser));
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('authMode', 'backend');
      setUser(sessionUser);
      setToken(authToken);
      setAuthMode('backend');

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Google login failed.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authMode');
    setUser(null);
    setToken('');
    setAuthMode('backend');
  };

  const forgotPassword = async (email) => {
    try {
      const response = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: { email }
      });

      return {
        success: true,
        message: response?.message || 'Password reset request submitted.',
        data: response?.data || null
      };
    } catch (error) {
      if (LOCAL_AUTH_FALLBACK_ENABLED && isConnectionError(error)) {
        const users = getLocalUsers();
        const foundUser = users.find((entry) => entry.email === email);
        if (!foundUser) {
          return {
            success: true,
            message: 'If an account with that email exists, a reset link has been prepared.'
          };
        }

        const token = `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
        const requests = getLocalResetRequests();
        requests[token] = {
          email,
          expiresAt
        };
        setLocalResetRequests(requests);

        return {
          success: true,
          message: 'Password reset token generated for local testing.',
          data: {
            reset_token: token,
            reset_url: `${window.location.origin}/reset-password?token=${token}`,
            expires_at: expiresAt
          }
        };
      }

      return {
        success: false,
        error: error.message || 'Forgot password request failed.'
      };
    }
  };

  const resetPassword = async (tokenValue, password) => {
    try {
      const response = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: {
          token: tokenValue,
          password
        }
      });

      return {
        success: true,
        message: response?.message || 'Password updated successfully.'
      };
    } catch (error) {
      if (LOCAL_AUTH_FALLBACK_ENABLED && isConnectionError(error)) {
        const requests = getLocalResetRequests();
        const request = requests[tokenValue];
        if (!request) {
          return { success: false, error: 'Reset token is invalid or has expired.' };
        }

        if (new Date(request.expiresAt).getTime() <= Date.now()) {
          delete requests[tokenValue];
          setLocalResetRequests(requests);
          return { success: false, error: 'Reset token is invalid or has expired.' };
        }

        const users = getLocalUsers();
        const updatedUsers = users.map((entry) =>
          entry.email === request.email ? { ...entry, password } : entry
        );
        setLocalUsers(updatedUsers);
        delete requests[tokenValue];
        setLocalResetRequests(requests);

        return {
          success: true,
          message: 'Password reset successful. You can now log in with your new password.'
        };
      }

      return {
        success: false,
        error: error.message || 'Password reset failed.'
      };
    }
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    token,
    authMode,
    isAuthenticated,
    isLoading,
    signup,
    login,
    forgotPassword,
    resetPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
