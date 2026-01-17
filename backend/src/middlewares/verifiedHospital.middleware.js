import Hospital from "../models/hospital.model.js";

const verifiedHospital= async (req,res,next)=>{
    try {
        const {userId}=req.user;

        const hospital=await Hospital.findById(userId);
        if(!hospital){
            return res.status(404).json({
                success:false,
                message:"Hospital does not exist"
            })
        }

        if(hospital.status!=="VERIFIED"){
            return res.status(409).json({
                success:false,
                message:"Hospital is not verified"
            })
        }

        req.hospital=hospital;

        next();

    } catch (error) {
        console.log("Error occered while verifying hospital");
        return res.status(500).json({
            success:false,
            message:"Internal Server error occered"
        })
    }
}


export default verifiedHospital;