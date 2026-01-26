import { createContext, useState, useEffect } from 'react';
//createContext → creates a global store
//useState → stores auth data
//useEffect → syncs data with localStorage
import { STORAGE_KEYS } from '../utils/constants';

export const AuthContext = createContext(null);

// Wrap your entire app with this to make auth state available everywhere

export const AuthProvider = ({ children }) => {
  
  // Token: JWT from backend, sent with every request
  // Initialize from localStorage, so user stays logged in after refresh
  const [token, setToken] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || null;
  });

  // User object: { _id, name, email, phone, role }
  // Initialize from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Hospital object (if user.role === 'HOSPITAL'): { _id, name, status, ... }
  // Initialize from localStorage
  const [hospital, setHospital] = useState(() => {
    const savedHospital = localStorage.getItem(STORAGE_KEYS.HOSPITAL);
    return savedHospital ? JSON.parse(savedHospital) : null;
  });

  // Loading state: true while making API calls
  const [loading, setLoading] = useState(false);
  
  // Whenever token changes, save/remove from localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  }, [token]);

  // Whenever user changes, save/remove from localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  // Whenever hospital changes, save/remove from localStorage
  useEffect(() => {
    if (hospital) {
      localStorage.setItem(STORAGE_KEYS.HOSPITAL, JSON.stringify(hospital));
    } else {
      localStorage.removeItem(STORAGE_KEYS.HOSPITAL);
    }
  }, [hospital]);

  // LOGIN FUNCTION
  // Called after successful login API call
  // Stores token and user in state + localStorage
  const login = (loginToken, loginUser, loginHospital = null) => {
    setToken(loginToken);
    setUser(loginUser);
    if (loginHospital) {
      setHospital(loginHospital);
    }
  };

  // LOGOUT FUNCTION
  // Clears all auth data
  // Called when:
  // 1. User clicks logout button
  // 2. Token expires (401 error in apiClient)
  // 3. User is unauthorized (403 error)
  const logout = () => {
    setToken(null);
    setUser(null);
    setHospital(null);
    // localStorage is cleared by useEffect hooks above
  };

  // CHECK IF USER IS AUTHENTICATED
  const isAuthenticated = !!token && !!user;


  // CHECK USER ROLE
  const hasRole = (role) => {
    return user?.role === role;
  };

  // CONTEXT VALUE

  // All data/functions available to components
  const value = {
    // State
    token,
    user,
    hospital,
    loading,
    setLoading,

    // Functions
    login,
    logout,
    setToken,
    setUser,
    setHospital,

    // Helpers
    isAuthenticated,
    hasRole,
  };

  
  // RENDER

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;