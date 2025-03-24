import mongoose from "mongoose";

const adminUserSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        
    }
   
})

export const AdminUserModel=mongoose.model("adminUsers",adminUserSchema)