import apiClient from './apiClient';

// Perform search across hospitals, doctors, services
export const searchAll = async (query) => {
    const res = await apiClient.get(`/search?q=${encodeURIComponent(query)}`);
    return res.data; // { hospitals, doctors, services }
};
