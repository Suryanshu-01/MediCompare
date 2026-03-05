import apiClient from './apiClient';

// Fetch hospitals pending verification (admin only)
export const getPendingHospitals = async () => {
    const res = await apiClient.get('/admin/hospitals/pending');
    return res.data.pendingHospitals;
};

// mark a hospital as verified
export const verifyHospital = async (hospitalId) => {
    const res = await apiClient.patch(`/admin/hospitals/${hospitalId}/verify`);
    return res.data;
};

// Fetch hospitals that were rejected
export const getRejectedHospitals = async () => {
    const res = await apiClient.get('/admin/hospitals/rejected');
    return res.data.rejectedHospitals;
};

// mark a hospital as rejected
export const rejectHospital = async (hospitalId) => {
    const res = await apiClient.patch(`/admin/hospitals/${hospitalId}/reject`);
    return res.data;
};
