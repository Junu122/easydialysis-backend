import mongoose from "mongoose";

const dialysisCenterSchema=new mongoose.Schema({
  
    
    CenterName:{
        type:String,
        required:true
    },
    CenterAddress:{
        type:String,
        required:true,
        
    },
    CenterCity:{
        type:String,
        required:true
    },
    ContactNumber:{
        type:String,
        default:null
    },
    Services:{
        type:[String],
        required:true
    },
    Facilities:{
        type:[String],
        required:true,
       
    },
    DialysisCharge:{
        type:String,
        required:true,
       
    },
    Slots:{
        type:String,
        required:true,
       
    },
    Photo:{
        type:String,
        required:true,
       
    },
    Status:{
        type:String,
        default:"active"
    },
   
})

export const DialysisCenterModel=mongoose.model("DialysisCenters",dialysisCenterSchema)