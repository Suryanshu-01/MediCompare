import express from "express";
import { searchAll } from "../controllers/search.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// authenticated search across hospitals, doctors and services
router.get("/search", authMiddleware, searchAll);

export default router;
