import apiClient from "../services/apiClient";

export const searchLoinc = async (query) => {
  const response = await apiClient.get("/services/loinc/search", {
    params: { q: query },
  });
  return response.data?.data || [];
};

export const createService = async (payload) => {
  const response = await apiClient.post("/hospital/services", payload);
  return response.data;
};

export const getServices = async () => {
  const response = await apiClient.get("/hospital/services");
  return response.data?.data || [];
};

export const updateService = async (id, payload) => {
  const response = await apiClient.patch(`/hospital/services/${id}`, payload);
  return response.data;
};

export const disableService = async (id) => {
  const response = await apiClient.delete(`/hospital/services/${id}`);
  return response.data;
};
