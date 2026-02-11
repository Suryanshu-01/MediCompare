import express from "express";
import {
  createService,
  getHospitalServices,
  getServicesById,
  updateService,
  deleteService,
} from "../controllers/services.controller.js";

const router = express.Router();

// Create new service
router.post("/", createService);

// Get all services for hospital
router.get("/", getHospitalServices);

// Get service by ID
router.get("/:id", getServicesById);

// Update service
router.patch("/:id", updateService);

// Delete service
router.delete("/:id", deleteService);

export default router;
