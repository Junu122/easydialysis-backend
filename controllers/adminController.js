import { DialysisCenterModel } from "../models/ADMIN/dialysisCenterModel.js";
import { AdminUserModel } from "../models/ADMIN/adminModel.js";
import { bookingModel } from "../models/USER/bookingModel.js";
import {userModel} from '../models/USER/userModel.js'
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"


const generateAccessToken=(user)=>{
    return jwt.sign({id:user._id},process.env.access_token_secret,{expiresIn:"24h"})
};


const addDialysisCenter=async(req,res)=>{
    const userid=req.userid;
  
    const {CenterName,CenterAddress,CenterCity,ContactNumber,Services,Facilities,DialysisCharge,Slots,Photo}=req.body;

    if(!CenterName || !CenterAddress || !CenterCity || !ContactNumber || !Services || !Facilities || !DialysisCharge || !Slots || !Photo){
        return res.json({success:false,message:"all fields are required"})
    }
    
    
 
    const newDialysisCenter=new DialysisCenterModel({
        CenterName,
        CenterAddress,
        CenterCity,
        ContactNumber,
        Services,
        Facilities,
        DialysisCharge,
        Slots,
        Photo
    })
   
    await newDialysisCenter.save()
    const alldialysiscenters=await DialysisCenterModel.find({})
    return res.json({success:true,message:"added succesfully",userid:userid,alldialysiscenters})
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
        maxAge:  2 * 24 * 60 * 60 * 1000, 
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

const getAppoinments=async(req,res)=>{
    const adminId=req.adminId

    try {
        const Appoinments=await bookingModel.find({}).populate("userId").populate('dialysisCenterId')
        if(!Appoinments){
           return res.json({success:false,message:"no appoinments found"})
        }
         return res.json({success:true,message:"appoinments found",Appoinments})
    } catch (error) {
        
    }
}


const deleteCenter=async(req,res)=>{
    const centerid=req.params.id;
    try {
        const result=await DialysisCenterModel.findByIdAndDelete(centerid);
        if(!result){
            return res.json({success:false,message:"not found"})
        }
        return res.json({success:true,message:"deleted succesfully",result})
    } catch (error) {
        return res.json({success:false,error})
    }
}

const updateAppoinment=async(req,res)=>{
    const appoinmentid=req.params.id;
    
    try{
        const data=req.body;
      const   updatedAppoinment=await bookingModel.findByIdAndUpdate(appoinmentid,data, {new: true, runValidators: true, })
      return res.json({success:true,message:"updated succesfully",updatedAppoinment})
    }catch(error){
      console.log(error)
    }
}


const getUsers=async(req,res)=>{
    const adminId=req.adminId;
    try {
        const Users=await userModel.find({});
        if(!Users){
            return res.json({success:false,message:"no user detected"})
        }
        return res.json({success:true,message:"users found",Users})
    } catch (error) {
        console.log(error)
    }
}

const updateUser=async(req,res)=>{
    const adminId=req.adminId;
    const userid=req.params.id;
    try {
        const data=req.body;
        const updateData=await userModel.findByIdAndUpdate(userid,data,{new: true, runValidators: true, })
        if(!updateData){
            return res.json({success:false,message:"no user found"})
        }
        return res.json({succces:true,message:"updated succesfully",updateData})
    } catch (error) {
        console.log(error)
    }
}

const allDialysisCenter=async(req,res)=>{
    const adminId=req.adminId;
    try {
        const dialysisCenters=await  DialysisCenterModel.find({});

        res.json({success:true,dialysisCenters,message:"details fetched succesfully"})
        console.log(dialysisCenters)
    } catch (error) {
        console.log(error)
    }
}


export {addDialysisCenter,adminLogin,adminLogout,getAdmin,updateCenter,getAppoinments,deleteCenter,updateAppoinment,getUsers,updateUser,allDialysisCenter}