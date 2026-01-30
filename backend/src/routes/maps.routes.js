import express from "express";
import { getVerifiedHospitals } from "../controllers/maps.controller.js";

const router = express.Router();

router.get("/hospitalslocation", getVerifiedHospitals);

export default router;
