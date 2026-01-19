import express from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import verifiedHospital from "../middlewares/verifiedHospital.middleware.js";
import upload from "../middlewares/upload.middleware.js";


const router = express.Router();



export default router;
