import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { getComparedDoctors } from "../../controllers/doctors/compare.controller.js";

const router = express.Router();

router.get("/compare", authMiddleware, getComparedDoctors);

export default router;
