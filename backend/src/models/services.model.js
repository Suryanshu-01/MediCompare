import mongoose, { Schema } from "mongoose";

const servicesSchema= new mongoose.Schema(
    {
        loincCode:{
            type:String,
            required:true,
        },
        displayName:{
            type:String,
            required:true,
            trim:true
        },
        category:{
            type:String,
        },
        hospitalId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Hospital",
            index:true,
            required:true,
        },
        price:{
            type:Number,
            required:true,
            min:0,
        },
        isActive:{
            type:Boolean,
            default:true,
        }
    },
    {
        timestamps:true,
    }
);

//Ek hoispital duplicate tests nhi create kr skta hai...
//Yaha humlog hospitalId and loincCode ko leke ek unique index bana rhe hai..taaki future main ye repeat ho to pata chal jaaye.
servicesSchema.index(
    {hospitalId:1,loincCode:1},
    {unique:true}
)

const Service=mongoose.model("Services",servicesSchema);
export default Service;