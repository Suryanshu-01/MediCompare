import express from "express";

import {
  createDoctor,
  getDoctorById,
  deleteDoctor,
  updateDoctor,
  getHospitalDoctors,
} from "../controllers/doctor.controller.js";


const router=express.Router();

router.post("/",createDoctor);
router.get("/",getHospitalDoctors)
router.get("/:id",getDoctorById)
router.patch("/:id",updateDoctor);
router.delete("/:id",deleteDoctor);

export default router;
