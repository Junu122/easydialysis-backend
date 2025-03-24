import { DialysisCenterModel } from "../models/ADMIN/dialysisCenterModel.js";
import { AdminUserModel } from "../models/ADMIN/adminModel.js";

import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"


const generateAccessToken=(user)=>{
    return jwt.sign({id:user._id},process.env.access_token_secret,{expiresIn:"50m"})
};


const addDialysisCenter=async(req,res)=>{
    const userid=req.userid;
  
    const {name,places,city,phone,specialities,photo}=req.body;
    console.log(name,places,city,phone,specialities,photo)
    if(!name || !places || !city || !phone || !specialities || !photo){
        return res.json({success:false,message:"all fields are required"})
    }
    
    
  console.log(photo,"photo")
    const newDialysisCenter=new DialysisCenterModel({
        name,
        places,
        city,
        phone,
        specialities,
        photo
    })

    await newDialysisCenter.save()

    return res.json({success:true,message:"added succesfully",userid:userid})
}

const adminLogin=async(req,res)=>{
    const {userName,password}=req.body;
    console.log(userName,password)

   try {
    const isadmin=await AdminUserModel.findOne({userName}).catch((error) => {
        console.error("Database error:", error);
        throw error;
    });
    if(!isadmin){
        return res.json({success:false,message:"invalid user"})
    }
    const ispasswordmatch=await bcrypt.compare(password,isadmin.password)
    if(!ispasswordmatch){
        return res.json({success:false,message:"password incorrect"})
    }

    const accessToken=generateAccessToken(isadmin)

    console.log("access token", accessToken)

    res.cookie("adminToken", accessToken, {
        httpOnly:true,
        secure: true,
        maxAge:  24 * 60 * 60 * 1000, 
    });

    return res.json({success:true,message:"login success",token:accessToken})

   } catch (error) {
    console.log(error,"error in login backend")
    return res.status(500).json({ success: false, error });
    
 
     
   }

}

const getAdmin=async(req,res)=>{
    const adminId=req.adminId;
    console.log("admin id in getadmin data",adminId)

    try {
        const adminData=await AdminUserModel.findById(adminId).select('-password')
        if(!adminData){
            return res.json({success:false,message:"no user found"})
        }
        return res.json({success:true,admin:adminData,message:"admin found succesfully"})
    } catch (error) {
        
    }

    
}

const adminLogout=async(req,res)=>{
    res.clearCookie("adminToken")
    return res.json({success:true,message:"logout success"})
}

const updateCenter=async(req,res)=>{
    const {centerid}=req.params
    const adminId=req.adminId;
   console.log(adminId,centerid)
    try {
        const data=req.body
        const adminData=await AdminUserModel.findById(adminId).select('password')
        if(!adminData){
            return res.json({success:false,message:"unauthorized access"})
        }
           const updateddialysis=await DialysisCenterModel.findByIdAndUpdate(centerid,data, {new: true, runValidators: true, })
        if(!updateddialysis){
            return res.json({success:false,message:"no center found "})
        }
        return res.json({success:true,updatedcenter:updateddialysis,message:"updated succesfully"})
        
    } catch (error) {
        console.log(error)
    }
}


export {addDialysisCenter,adminLogin,adminLogout,getAdmin,updateCenter}