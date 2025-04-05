import mongoose from "mongoose";


const bookingSchema=new mongoose.Schema({
    dialysisCenterId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'DialysisCenters',
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
        ref:'users',
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
    },
    stripePaymentId:{
        type:String,
        required:true
    },
    paymentTime:{
        type:Date,
        default:Date.now
    },
    appoinmentCancel:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

export const bookingModel=mongoose.model("bookings",bookingSchema)