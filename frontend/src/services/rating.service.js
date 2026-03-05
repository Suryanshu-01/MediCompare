import apiClient from "./apiClient";

export const getHospitalRatings = async (hospitalId) => {
  const res = await apiClient.get(`/ratings/${hospitalId}`);
  return res.data;
};

export const rateDoctors = async (hospitalId, rating) => {
  const res = await apiClient.post("/ratings/doctor", { hospitalId, rating });
  return res.data;
};

export const rateServices = async (hospitalId, rating) => {
  const res = await apiClient.post("/ratings/service", { hospitalId, rating });
  return res.data;
};

const ratingService = {
  getHospitalRatings,
  rateDoctors,
  rateServices,
};

export default ratingService;

