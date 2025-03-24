import mongoose from "mongoose";

const dialysisCenterSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    places:{
        type:String,
        required:true,
        
    },
    city:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        default:null
    },
    specialities:{
        type:String,
        required:true
    },
    photo:{
        type:String,
        required:true,
       
    }
   
})

export const DialysisCenterModel=mongoose.model("DialysisCenters",dialysisCenterSchema)