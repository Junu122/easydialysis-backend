import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { userModel } from "../models/USER/userModel.js"
import { DialysisCenterModel } from "../models/ADMIN/dialysisCenterModel.js";
import { bookingModel } from "../models/USER/bookingModel.js";
import Stripe from "stripe";

const generateAccessToken=(user)=>{
    return jwt.sign({id:user._id},process.env.access_token_secret,{expiresIn:"2m"})
};

const generateRefreshToken=(user)=>{
    return jwt.sign({id:user._id},process.env.refresh_token_secret,{expiresIn:"24h"})
}


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
        return res.status(201).json({success:true,message:"user created succesfully",data:newuser})
    } catch (error) {
        
    }
}

const Login=async(req,res)=>{
    const {email,password}=req.body;
    try {
        const existuser=await userModel.findOne({email})
        console.log(existuser,"existuser in backend")
        if(!existuser){
            return res.json({success:false,usererror:"no user exist"})
        }
    
        const ispasswordmatch=await bcrypt.compare(password,existuser.password)
        console.log(ispasswordmatch,"password is match")
        if(!ispasswordmatch){
            return res.json({success:false,passerror:"password is incorrect"})
        }
    
       
        const accessToken=generateAccessToken(existuser)
        const refreshToken=generateRefreshToken(existuser)
        
        res.cookie("refreshToken", refreshToken, {
            httpOnly:true,
            secure: true,
            maxAge:  24 * 60 * 60 * 1000, 
        });
        res.cookie("accesstoken", accessToken, {
            httpOnly:true,
            secure: true,
            maxAge: 24* 60 * 60 * 1000, 
        });
       
    
         
        return res.json({success:true,message:"login success",user:existuser,accessToken,refreshToken})
    } catch (error) {
        res.status(500).json({success:false,message:error})
    }
   
}



const refreshAccessToken=async(req,res)=>{
    const refreshtoken=req.cookies.refreshToken;
   if(!refreshtoken){
     return res.status(401).json({success:false,message:"no refresh token available"})
   }
   try {
    const decoded=jwt.verify(refreshtoken,process.env.refresh_token_secret)
    const user=await userModel.findById(decoded.id)
    if(!user){
        res.status(401.).json({success:false,message:"no user found"})
    }
    const newaccesstoken=generateAccessToken(user)

    res.cookie("accessToken", newaccesstoken, {
        httpOnly:true,
        secure: true,
        maxAge: 24*60 * 60 * 1000, 
    });
  return  res.status(201).json({success:true,accesstoken:newaccesstoken})
   } catch (error) {
    
   return res.status(401).json({success:false,error})
   }
}


const getUserdata=async(req,res)=>{
    console.log("etnered getUserDAta")
    const userid=req.userid;
    try {
        const user=await userModel.findById(userid).select('-password');
        res.status(201).json({success:true,user:user})
    } catch (error) {
        res.status(401).json({success:false,message:error})
    }
}

const logout=async(req,res)=>{
    res.clearCookie("refreshToken")
    res.clearCookie('accessToken')
    res.json({success:true,message:"logout success"})
}


const allDialysisCenter=async(req,res)=>{

    try {
        const dialysisCenters=await  DialysisCenterModel.find()
        res.json({success:true,data:dialysisCenters,message:"details fetched succesfully"})
        console.log(dialysisCenters)
    } catch (error) {
        console.log(error)
    }
}


const makePayment=async(req,res)=>{
    const stripe=new Stripe(process.env.STRIPE_SECRET)
    try {
        const data=req.body;
        console.log(data)

        const session=await stripe.checkout.sessions.create({
            mode:"payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: data.centerName, 
                        },
                        unit_amount: Math.round(data.price * 100), 
                    },
                    quantity: 1, 
                }
            ],
            mode:"payment",
            success_url:`http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:"https://dribbble.com/tags/payment-failiure",
            metadata: {
                
                dialysisCenterId:data.centerId,
                appointmentDate:data.date,
                appoinmentTime:data.time,
              },
        })

       return res.json({session})
    } catch (error) {
        console.log(error)
    }
}

const savePayment=async(req,res)=>{
    const stripe=new Stripe(process.env.STRIPE_SECRET)
    const sig = req.headers["stripe-signature"];
    console.log(sig,"sig")
    console.log( "req.body type of  :",typeof req.body);

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        if (event.type === "checkout.session.completed"){
            const session = event.data.object;
            console.log("session in save payment-----------  ;",session.metadata.appoinmentTime)

            const newBooking=new bookingModel({
                dialysisCenterId:session.metadata.dialysisCenterId,
                appoinmentDate:new Date(session.metadata.appointmentDate),
                appoinmentTime:session.metadata.appoinmentTime,
                userId:'6787793545f9833961f0a29b',
                paymentStatus:"success",
                bookingStatus:"pending",
                paymentAmount:session.amount_total,
            })

            await newBooking.save()

            console.log("new booking  :",newBooking)
        }


    } catch (error) {
        console.log(error)
    }
}









export {register,Login,refreshAccessToken,getUserdata,logout,allDialysisCenter,makePayment,savePayment}