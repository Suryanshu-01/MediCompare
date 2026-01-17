import Hospital from "../models/hospital.model.js";

const getPendingHospitals = async (req, res) => {
  try {
    const pendingHospitals = await Hospital.find({ status: "PENDING" })
      .populate("userId", "name email phone")
      .lean();

    return res.status(200).json({
      success: true,
      count: pendingHospitals.length,
      pendingHospitals,
    });
  } catch (error) {
    console.error("Get pending hospital error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred",
    });
  }
};

const verifyHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    if (hospital.status !== "PENDING") {
      return res.status(409).json({
        success: false,
        message: `Hospital cannot be verified (current status: ${hospital.status})`,
      });
    }

    hospital.status = "VERIFIED";
    await hospital.save();

    return res.status(200).json({
      success: true,
      message: "Hospital successfully verified",
    });
  } catch (error) {
    console.error("Verify hospital error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred",
    });
  }
};


const rejectHospital= async (req,res)=>{
    try {
        const {hospitalId}=req.params;
        const hospital=await Hospital.findById(hospitalId);
        if(!hospital){
            return res.status(404).json({
                success:false,
                message:"Hospital not found"
            })
        }

        if(hospital.status!=="PENDING"){
            return res.status(409).json({
                success:false,
                message:`Hospital cannot be Rejected (current status: ${hospital.status})`
            })
        }
        
        hospital.status="REJECTED";

        await hospital.save();

        return res.status(200).json({
            success:true,
            message:"Hospitals request has been successfully rejected"
        })


    } catch (error) {
        console.log("Cannot reject Hospital",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error occur"
        })
    }
}



export {
  getPendingHospitals,
  verifyHospital,
  rejectHospital
};
