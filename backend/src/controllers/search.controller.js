import Hospital from "../models/hospital.model.js";
import Doctor from "../models/doctor.model.js";
import Service from "../models/services.model.js";

// build a fuzzy regex: insert .* between each char for loose matching
const buildFuzzyRegex = (input) => {
    const escaped = input.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const pattern = escaped.split("").join(".*");
    return new RegExp(pattern, "i");
};

const searchAll = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim() === "") {
            return res.status(400).json({ success: false, message: "Query required" });
        }
        const regex = buildFuzzyRegex(q);

        const hospitalsPromise = Hospital.find({ name: regex, status: "VERIFIED" })
            .lean();

        const doctorsPromise = Doctor.find({
            $or: [{ name: regex }, { specialization: regex }],
        }).lean();

        const servicesPromise = Service.find({
            $or: [{ displayName: regex }, { category: regex }],
        }).lean();

        const [hospitals, doctors, services] = await Promise.all([
            hospitalsPromise,
            doctorsPromise,
            servicesPromise,
        ]);

        return res.status(200).json({
            success: true,
            hospitals,
            doctors,
            services,
        });
    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export { searchAll };
