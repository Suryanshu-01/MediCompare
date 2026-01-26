import apiClient from './apiClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

// LOGIN
export const login = async (email, password) => {
  const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
    email,
    password,
  });
  return response.data;
};

// REGISTER USER
export const register = async (name, email, password, phone) => {
  const response = await apiClient.post(API_ENDPOINTS.REGISTER, {
    name,
    email,
    password,
    phone,
    role: 'USER',
  });
  return response.data;
};

// REGISTER HOSPITAL
export const hospitalRegister = async (formData) => {
  const response = await apiClient.post(
    API_ENDPOINTS.HOSPITAL_REGISTER,
    formData
  );
  return response.data;
};

// GET CURRENT USER (OPTIONAL)
export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

// LOGOUT
export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.HOSPITAL);
};

const authService = {
  login,
  register,
  hospitalRegister,
  getCurrentUser,
  logout,
};

export default authService;
