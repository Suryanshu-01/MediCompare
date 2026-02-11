import express from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import verifiedHospital from "../middlewares/verifiedHospital.middleware.js";
import doctorRoutes from "./doctor.routes.js";
import servicesRoutes from "./services.routes.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("HOSPITAL"), verifiedHospital);

router.use("/doctors", doctorRoutes);
router.use("/services", servicesRoutes);

export default router;
