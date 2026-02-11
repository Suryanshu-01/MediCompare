// backend/src/routes/loinc.routes.js
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { searchLoincTests } from "../controllers/loinc.controller.js";

const router = express.Router();

router.get("/search", authMiddleware, searchLoincTests);

export default router;
