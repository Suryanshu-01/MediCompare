import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  rateDoctors,
  rateServices,
  getHospitalRatings,
  getDoctorRating,
} from "../controllers/rating.controller.js";

const router = express.Router();

// All rating routes require an authenticated user
router.use(authMiddleware);

// GET /api/ratings/doctor/:doctorId - get current rating for a doctor
router.get("/doctor/:doctorId", getDoctorRating);

// POST /api/ratings/doctor - submit rating for a specific doctor
router.post("/doctor", rateDoctors);

// POST /api/ratings/service - submit rating for services of a hospital
router.post("/service", rateServices);

// GET /api/ratings/:hospitalId - get current ratings for a hospital
router.get("/:hospitalId", getHospitalRatings);

export default router;

