import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  rateDoctors,
  rateServices,
  getHospitalRatings,
} from "../controllers/rating.controller.js";

const router = express.Router();

// All rating routes require an authenticated user
router.use(authMiddleware);

// POST /api/ratings/doctor - submit rating for doctors of a hospital
router.post("/doctor", rateDoctors);

// POST /api/ratings/service - submit rating for services of a hospital
router.post("/service", rateServices);

// GET /api/ratings/:hospitalId - get current ratings for a hospital
router.get("/:hospitalId", getHospitalRatings);

export default router;

