import Doctor from "../models/doctor.model.js";
import Hospital from "../models/hospital.model.js";

const createDoctor= async (req,res)=>{
    try {
        const doctor=await Doctor.create({
            hospitalId:req.hospitalId,
            ...req.bady,
        });

        if(!doctor){
            console.log("Doctor is not created");
            return res.status(400).json({
                success:false,
                message:"Doctor creation failed",
            })
        }
        
        res.status(200).json({
            success:true,
            data:doctor,
        });

        
    } catch (error) {
        console.log("Error found:  ",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server ERROR occur",
        })
    }
}

const getHospitalDoctors= async (req,res)=>{
    try {
        const doctors=await Doctor.findOne({hospitalId:req.hospitalId}).sort({createdAt:-1}); //jaayega or check krega ki kahi koi hospitalId field main iss field ka koi hai kya?....sort doctor on the basis of creation time.

        return res.status(200).json({
            success:true,
            data:doctors
        })
        
    } catch (error) {
        console.log("Error found while creating doctor:  ",error);
        return res.status(500).json({
            success:false,
            message:"Interbnal server error occur"
        })
    }
};


const getDoctorById= async (req,res)=>{
    try {
        const doctorId=req.params.id;
        const doctor=await Doctor.findOne({
            _id:doctorId,
            hospitalId:req.hospitalId,
        });

        if(!doctor){
            return res.status(404).json({
                success:false,
                message:"Doctor Not Found"
            })
        }

        return res.status(200).json({
            success:true,
            data:doctor,
        });
        
    } catch (error) {
        console.log("Server error occur: ",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error occur",
        })
    }
}

const updateDoctor= async (req,res)=>{
    try {

        delete req.body.hospitalId;//prevents changing credential field which links the two database. ye clint ke through aata hai



        const doctorId=req.params.id;
        const doctor=await Doctor.findByIdAndUpdate({
            _id:req.params.id,
            hospitalId:req.hospitalId
        },
        req.body,
        {
            run:true,
            runValidators:true,// enforce schema rules.

        })

        if(!doctor){
            return res.status(404).json({
                success:false,
                message:"Doctor Not Found",
            })
        }

        return res.status(200).json({
            success:true,
            data:doctor,
        })
        
    } catch (error) {
        console.log("Server Error found", error);
        return res.status(500).json({
            success:false,
            message:"Internal Server error occur",
        })
    }
}


const deleteDoctor= async (req,res)=>{
    try {
        const doctor=await Doctor.findOneAndDelete({
            _id:req.params.id,
            hospitalId:req.hospitalId,
        });

        return res.status(200).json({
            success:true,
            data:doctor,
        })
        
    } catch (error) {
        console.log("Error occur:  ",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server error occur",
        })
    }
}

export {
    createDoctor,
    getDoctorById,
    deleteDoctor,
    updateDoctor,
    getHospitalDoctors,
}