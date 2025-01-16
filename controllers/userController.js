import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { userModel } from "../models/userModel.js"
const register=async(req,res)=>{
    const {username,email,password}=req.body;
    console.log(username,email,password)
    if(!username,!email,!password){
        return res.json({success:false,message:"all fields are required"})
    }


    try {
        const existuser=await userModel.findOne({email})

        if(existuser){
            return res.json({success:false,message:"email already exist"})
        }

        const hashedpassword=await bcrypt.hash(password,10)

        const newuser= new userModel({
            username,
            password:hashedpassword,
            email
        })

        await newuser.save()

        console.log(newuser)
        return res.json({success:true,message:"user created succesfully",data:newuser})
    } catch (error) {
        
    }
}

const Login=async(req,res)=>{
    const {email,password}=req.body;

    const existuser=await userModel.findOne({email})

    if(!existuser){
        return res.json({success:false,usererror:"no user exist"})
    }

    const ispasswordmatch=await bcrypt.compare(password,existuser.password)
    if(!ispasswordmatch){
        return res.json({success:false,passerror:"password is incorrect"})
    }

    const token=jwt.sign({id:existuser._id},process.env.jwt_secret)
    const refreshtoken=jwt.sign({id:existuser._id},process.env.jwt_secret,{expiresIn:'10m'})
    res.cookie('refreshtoken', refreshtoken);
    return res.json({success:true,message:"login success",user:existuser,token})
}

export {register,Login}