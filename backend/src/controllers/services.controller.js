import Service from "../models/services.model.js";

/**
 * CREATE SERVICE
 */
const createService = async (req, res) => {
  try {
    const hospitalId = req.hospitalId;
    const { loincCode, displayName, category, price } = req.body;

    const service = await Service.create({
      hospitalId,
      loincCode,
      displayName,
      category,
      price,
    });

    res.status(201).json({
      success: true,
      message: "Service added successfully",
      data: service,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Service already exists for this hospital",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create service",
    });
  }
};

/**
 * READ ALL SERVICES (Hospital dashboard)
 */
const getHospitalServices = async (req, res) => {
  try {
    const hospitalId = req.hospitalId;

    const services = await Service.find({
      hospitalId,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
    });
  }
};

/**
 * READ SINGLE SERVICE
 */
const getServicesById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findOne({
      _id: id,
      hospitalId: req.hospitalId,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch service",
    });
  }
};

/**
 * UPDATE SERVICE
 */
const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findOneAndUpdate(
      { _id: id, hospitalId: req.hospitalId },
      req.body,
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to update service",
    });
  }
};

/**
 * DELETE SERVICE (SOFT DELETE)
 */
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findOneAndUpdate(
      { _id: id, hospitalId: req.hospitalId },
      { isActive: false },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service disabled successfully",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to delete service",
    });
  }
};

export {
  createService,
  getHospitalServices,
  getServicesById,
  updateService,
  deleteService,
};
