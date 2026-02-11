import Hospital from "../models/hospital.model.js";

const ensureHospital = async (req, res, next) => {
  try {
    if (req.user.role !== "HOSPITAL") {
      return res.status(409).json({
        success: false,
        message: "Hospital is not authorized",
      });
    }
    const hospital = await Hospital.findOne({ userId: req.user.userId });
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital profile not found",
      });
    }
    if (hospital.status != "VERIFIED") {
      return res.status(403).json({
        success: false,
        message: "Hospital is not verified",
      });
    }
    req.hospitalId = hospital.id;
    next();
  } catch (error) {
    console.log("error occur in middleware:  ", error);
    return res.status(500).json({
      success: false,
      message: "Interna server error occur",
    });
  }
};

export default ensureHospital;
