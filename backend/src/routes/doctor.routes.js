import express from "express";

import {
  createDoctor,
  getDoctorById,
  deleteDoctor,
  updateDoctor,
  getHospitalDoctors,
} from "../controllers/doctor.controller.js";
import upload from "../middlewares/upload.middleware.js";


const router=express.Router();

router.post("/", upload.single('photo'), createDoctor);
router.get("/",getHospitalDoctors)
router.get("/:id",getDoctorById)
router.patch("/:id", upload.single('photo'), updateDoctor);
router.delete("/:id",deleteDoctor);

export default router;
