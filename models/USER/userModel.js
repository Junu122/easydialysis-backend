import mongoose from "mongoose";


const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    usertoken:{
        type:String,
        default:null

    }
})

export const userModel=mongoose.model("users",userSchema)