import apiClient from "./apiClient";

export const getHospitalRatings = async (hospitalId) => {
  const res = await apiClient.get(`/ratings/${hospitalId}`);
  return res.data;
};

export const rateDoctors = async (doctorId, rating) => {
  const res = await apiClient.post("/ratings/doctor", { doctorId, rating });
  return res.data;
};

export const getDoctorRating = async (doctorId) => {
  const res = await apiClient.get(`/ratings/doctor/${doctorId}`);
  return res.data;
};

export const rateServices = async (hospitalId, rating) => {
  const res = await apiClient.post("/ratings/service", { hospitalId, rating });
  return res.data;
};

const ratingService = {
  getHospitalRatings,
  rateDoctors,
  getDoctorRating,
  rateServices,
};

export default ratingService;

