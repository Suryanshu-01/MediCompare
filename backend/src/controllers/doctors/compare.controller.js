import mongoose from "mongoose";
import {
  compareDoctorsByIds,
  MIN_IDS,
  MAX_IDS,
} from "../../services/doctorCompare.service.js";

const getComparedDoctors = async (req, res) => {
  try {
    const idsParam = req.query.ids;

    if (!idsParam) {
      return res.status(400).json({
        message: "Query parameter ids is required",
      });
    }

    const ids = String(idsParam)
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length < MIN_IDS || uniqueIds.length > MAX_IDS) {
      return res.status(400).json({
        message: `Please provide between ${MIN_IDS} and ${MAX_IDS} doctor ids`,
      });
    }

    const hasInvalidObjectId = uniqueIds.some(
      (id) => !mongoose.Types.ObjectId.isValid(id),
    );

    if (hasInvalidObjectId) {
      return res.status(400).json({
        message: "One or more doctor ids are invalid",
      });
    }

    const response = await compareDoctorsByIds(uniqueIds);

    return res.status(200).json(response);
  } catch (error) {
    if (error.message === "One or more doctors were not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message.includes("Please select between")) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Doctor compare error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { getComparedDoctors };
