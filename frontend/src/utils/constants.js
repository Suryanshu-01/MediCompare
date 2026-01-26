
// USER ROLES
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  HOSPITAL: 'HOSPITAL',
};

// HOSPITAL STATUS
export const HOSPITAL_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
};

// CONSULTATION TYPE
export const CONSULTATION_TYPE = {
  OPD: 'OPD',
  IPD: 'IPD',
  BOTH: 'BOTH',
};

// GENDER
export const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
};

// API CONFIG
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

// API ENDPOINTS (FIXED)
export const API_ENDPOINTS = {
  // AUTH
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  HOSPITAL_REGISTER: '/auth/hospital/register',

  // ADMIN
  ADMIN_PENDING_HOSPITALS: '/admin/hospitals/pending',
  ADMIN_VERIFY_HOSPITAL: '/admin/hospital/:id/verify',

  // HOSPITAL
  HOSPITAL_DOCTOR: '/hospital/doctors',
  ADD_DOCTOR: '/hospital/doctor',
  UPDATE_DOCTOR: '/hospital/doctor/:id',
  DELETE_DOCTOR: '/hospital/doctor/:id',
};

// LOCAL STORAGE KEYS
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  HOSPITAL: 'hospital',
};

// VALIDATION RULES
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\d{10}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'application/pdf',
  ],
  MAX_FILE_SIZE: 5 * 1024 * 1024,
};

// ROUTES
export const ROUTES = {
  HOME: '/',
  LOGIN: '/',
  REGISTER: '/register',

  USER_DASHBOARD: '/user/dashboard',
  HOSPITAL_DASHBOARD: '/hospital/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',

  DOCTORS: '/hospital/doctors',
  ADD_DOCTOR: '/hospital/doctor/add',

  NOT_FOUND: '*',
};

// MESSAGES
export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Phone number must be 10 digits',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  REQUIRED_FIELD: 'This field is required',
  LOGIN_FAILED: 'Invalid email or password',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  UNAUTHORIZED: 'You are not authorized to access this page',
  FILE_TOO_LARGE: 'File size must be less than 5MB',
  INVALID_FILE_TYPE: 'Only JPG, PNG, or PDF files are allowed',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTRATION_SUCCESS: 'Registration successful!',
  HOSPITAL_SUBMITTED:
    'Hospital registration submitted for verification',
  DOCTOR_ADDED: 'Doctor added successfully',
  DOCTOR_UPDATED: 'Doctor updated successfully',
  DOCTOR_DELETED: 'Doctor removed successfully',
};
