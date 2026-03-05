import express from "express";
import { getPendingHospitals, getRejectedHospitals, verifyHospital, rejectHospital } from "../controllers/admin.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/hospitals/pending", authMiddleware, roleMiddleware("ADMIN"), getPendingHospitals);
router.get("/hospitals/rejected", authMiddleware, roleMiddleware("ADMIN"), getRejectedHospitals);


router.patch(
    "/hospitals/:hospitalId/verify",
    authMiddleware,
    roleMiddleware("ADMIN"),
    verifyHospital
)
router.patch(
    "/hospitals/:hospitalId/reject",
    authMiddleware,
    roleMiddleware("ADMIN"),
    rejectHospital
)


export default router;