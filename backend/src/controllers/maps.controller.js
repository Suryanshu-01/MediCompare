import Hospital from "../models/hospital.model.js";

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
            }
        );

        // Transform data for frontend / Mapbox
        const response = hospitals.map((hospital) => ({
            _id: hospital._id,
            name: hospital.name,
            lng: hospital.location.coordinates[0],
            lat: hospital.location.coordinates[1],
            minFees: hospital.minFees,
        }));

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
