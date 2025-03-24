import mongoose from "mongoose";


const bookingSchema=new mongoose.Schema({
    dialysisCenterId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    appoinmentDate:{
        type:Date,
        required:true,
    },
    appoinmentTime:{
        type:String,
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        default:true
    },
    paymentStatus:{
        type:String,
        required:true
    },
    bookingStatus:{
        type:String,
        required:true,
        default:"pending"
    },
    paymentAmount:{
        type:Number,
        required:true
    },
    paymentTime:{ 
        type: Date, default: Date.now
    }
},{timestamps:true})

export const bookingModel=mongoose.model("bookings",bookingSchema)