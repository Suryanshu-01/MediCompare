import Hospital from "../models/hospital.model.js";

const validateRating = (rating) => {
  if (typeof rating !== "number" || Number.isNaN(rating)) {
    return false;
  }
  if (rating < 1 || rating > 10) {
    return false;
  }
  return true;
};

const rateDoctors = async (req, res) => {
  try {
    const { hospitalId, rating } = req.body;

    if (!hospitalId) {
      return res
        .status(400)
        .json({ success: false, message: "hospitalId is required" });
    }

    if (!validateRating(rating)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 10",
      });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res
        .status(404)
        .json({ success: false, message: "Hospital not found" });
    }

    const currentAvg = hospital.doctorRating || 0;
    const currentCount = hospital.doctorRatingCount || 0;
    const newCount = currentCount + 1;
    const newAvg = (currentAvg * currentCount + rating) / newCount;

    hospital.doctorRating = newAvg;
    hospital.doctorRatingCount = newCount;

    // recompute hospitalRating as average of available doctor/service ratings
    const doctorContribution =
      hospital.doctorRatingCount > 0 ? hospital.doctorRating : null;
    const serviceContribution =
      hospital.serviceRatingCount > 0 ? hospital.serviceRating : null;

    const values = [
      doctorContribution,
      serviceContribution,
    ].filter((v) => typeof v === "number");

    hospital.hospitalRating =
      values.length > 0
        ? values.reduce((sum, val) => sum + val, 0) / values.length
        : 0;

    await hospital.save();

    return res.status(200).json({
      success: true,
      doctorRating: hospital.doctorRating,
      doctorRatingCount: hospital.doctorRatingCount,
      hospitalRating: hospital.hospitalRating,
    });
  } catch (error) {
    console.error("Doctor rating error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const rateServices = async (req, res) => {
  try {
    const { hospitalId, rating } = req.body;

    if (!hospitalId) {
      return res
        .status(400)
        .json({ success: false, message: "hospitalId is required" });
    }

    if (!validateRating(rating)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 10",
      });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res
        .status(404)
        .json({ success: false, message: "Hospital not found" });
    }

    const currentAvg = hospital.serviceRating || 0;
    const currentCount = hospital.serviceRatingCount || 0;
    const newCount = currentCount + 1;
    const newAvg = (currentAvg * currentCount + rating) / newCount;

    hospital.serviceRating = newAvg;
    hospital.serviceRatingCount = newCount;

    // recompute hospitalRating as average of available doctor/service ratings
    const doctorContribution =
      hospital.doctorRatingCount > 0 ? hospital.doctorRating : null;
    const serviceContribution =
      hospital.serviceRatingCount > 0 ? hospital.serviceRating : null;

    const values = [
      doctorContribution,
      serviceContribution,
    ].filter((v) => typeof v === "number");

    hospital.hospitalRating =
      values.length > 0
        ? values.reduce((sum, val) => sum + val, 0) / values.length
        : 0;

    await hospital.save();

    return res.status(200).json({
      success: true,
      serviceRating: hospital.serviceRating,
      serviceRatingCount: hospital.serviceRatingCount,
      hospitalRating: hospital.hospitalRating,
    });
  } catch (error) {
    console.error("Service rating error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getHospitalRatings = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    if (!hospitalId) {
      return res
        .status(400)
        .json({ success: false, message: "hospitalId is required" });
    }

    const hospital = await Hospital.findById(hospitalId)
      .select(
        "doctorRating doctorRatingCount serviceRating serviceRatingCount hospitalRating",
      )
      .lean();

    if (!hospital) {
      return res
        .status(404)
        .json({ success: false, message: "Hospital not found" });
    }

    return res.status(200).json({
      success: true,
      doctorRating: hospital.doctorRating,
      doctorRatingCount: hospital.doctorRatingCount,
      serviceRating: hospital.serviceRating,
      serviceRatingCount: hospital.serviceRatingCount,
      hospitalRating: hospital.hospitalRating,
    });
  } catch (error) {
    console.error("Get hospital ratings error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { rateDoctors, rateServices, getHospitalRatings };

