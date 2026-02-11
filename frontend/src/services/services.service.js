import apiClient from "./apiClient";

export const createService = async (payload) => {
  const res = await apiClient.post("/hospital/services", payload);
  return res.data;
};

export const getHospitalServices = async () => {
  const res = await apiClient.get("/hospital/services");
  return res.data.data;
};

export const updateService = async (id, payload) => {
  const res = await apiClient.patch(`/hospital/services/${id}`, payload);
  return res.data;
};

export const deleteService = async (id) => {
  const res = await apiClient.delete(`/hospital/services/${id}`);
  return res.data;
};

const servicesService = {
  createService,
  getHospitalServices,
  updateService,
  deleteService,
};

export default servicesService;
