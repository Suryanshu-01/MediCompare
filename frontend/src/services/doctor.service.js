// ==========================================
// DOCTOR SERVICE
// ==========================================
// API calls for doctor CRUD operations

import apiClient from './apiClient';

// Add new doctor
export const addDoctor = async (doctorData) => {
  try {
    const response = await apiClient.post('/hospital/doctors', doctorData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get doctors for hospital
export const getDoctors = async () => {
  try {
    const response = await apiClient.get('/hospital/doctors');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get single doctor by id
export const getDoctorById = async (doctorId) => {
  try {
    const response = await apiClient.get(`/hospital/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update doctor
export const updateDoctor = async (doctorId, doctorData) => {
  try {
    const response = await apiClient.patch(`/hospital/doctors/${doctorId}`, doctorData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete (soft delete) doctor
export const deleteDoctor = async (doctorId) => {
  try {
    const response = await apiClient.delete(`/hospital/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const doctorService = {
  addDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};

export default doctorService;
