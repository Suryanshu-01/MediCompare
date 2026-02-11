import mongoose, { Schema } from "mongoose";

const doctorSchema= new Schema(
    {
        hospitalId:{
            type:Schema.Types.ObjectId,//is MongoDB’s built-in ID type used to store the _id of another document and create a relationship between collections. in short....This doctor belongs to the hospital whose _id is stored here
            ref:"Hospital",
            required:true,
            index:true
        },
        name:{
            type:String,
            required:true,
            trim:true,
        },
        gender:{
            type:String,
            enum:["MALE","FEMALE","OTHER"],
        },
            photo:{
            url:String,
            publicId:String
        },
        qualification:{
            type:[String],
            required:true,
            trim:true,
        },
        specialization:{
            type:String,
            required:true,
            trim:true,
        },
        experience:{
            type:Number,
            required:true,
            min:0
        },
        registrationNumber:{
            type:Number,
            required:true,
            trim:true
        },
        consultationType:{
            type:String,
            enum:["OPD","IPD","BOTH"],
            required:true
        },
        consultationFee:{
            type:Number,
            required:true,
            min:0
        },
        availability:{
            days:{
                type:[String],
                required:true
            },
            timeSlots:[
                {
                    start:{type:String,required:true},
                    end:{ type:String,required:true},
                }
            ]
        },
        description:{
            type:String,
            required:true,
            maxlength:500,
        },
        isActive:{
            type:Boolean,
            default:true
        },
    },
    {
        timestamps:true,
    }
);

const doctor=mongoose.model("Doctor",doctorSchema);

export default doctor;