import Hospital from "../models/hospital.model.js";
import Service from "../models/services.model.js";
import Doctor from "../models/doctor.model.js";

export const getVerifiedHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find(
            {
                status: "VERIFIED",
                isActive: true,
            },
            {
                name: 1,
                location: 1,
                minFees: 1,
                address: 1,
                doctorRating: 1,
                serviceRating: 1,
                hospitalRating: 1,
            }
        );

        // compute service price range per hospital (min/max)
        const servicePriceAgg = await Service.aggregate([
            {
                $match: {
                    isActive: true,
                },
            },
            {
                $group: {
                    _id: "$hospitalId",
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" },
                },
            },
        ]);

        const servicePriceByHospital = {};
        servicePriceAgg.forEach((row) => {
            servicePriceByHospital[String(row._id)] = {
                minPrice: row.minPrice,
                maxPrice: row.maxPrice,
            };
        });

        // compute minimum consultation fee per hospital from doctors
        const doctorMinFeeAgg = await Doctor.aggregate([
            {
                $match: {
                    isActive: true,
                },
            },
            {
                $group: {
                    _id: "$hospitalId",
                    minConsultationFee: { $min: "$consultationFee" },
                },
            },
        ]);

        const doctorMinFeeByHospital = {};
        doctorMinFeeAgg.forEach((row) => {
            doctorMinFeeByHospital[String(row._id)] = row.minConsultationFee;
        });

        // Transform data for frontend / Mapbox
        const response = hospitals.map((hospital) => {
            const serviceInfo =
                servicePriceByHospital[String(hospital._id)] || {};
            const minConsultationFee =
                doctorMinFeeByHospital[String(hospital._id)] ?? null;

            return {
                _id: hospital._id,
                name: hospital.name,
                lng: hospital.location.coordinates[0],
                lat: hospital.location.coordinates[1],
                minFees: minConsultationFee,
                address: hospital.address,
                doctorRating: hospital.doctorRating,
                serviceRating: hospital.serviceRating,
                hospitalRating: hospital.hospitalRating,
                serviceMinPrice: serviceInfo.minPrice ?? null,
                serviceMaxPrice: serviceInfo.maxPrice ?? null,
            };
        });

        res.status(200).json({
            success: true,
            count: response.length,
            data: response,
        });
    } catch (error) {
        console.error("Error fetching hospitals for map:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch hospitals",
        });
    }
};
