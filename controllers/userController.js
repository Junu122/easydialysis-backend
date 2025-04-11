import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { userModel } from "../models/USER/userModel.js"
import { DialysisCenterModel } from "../models/ADMIN/dialysisCenterModel.js";
import { bookingModel } from "../models/USER/bookingModel.js";
import Stripe from "stripe";
import { OAuth2Client } from "google-auth-library";
import { OtpVerificationModel } from "../models/USER/otpVerificationModel.js";
import nodemailer from "nodemailer"
import crypto from "crypto"

const generateAccessToken=(user)=>{
    return jwt.sign({id:user._id},process.env.access_token_secret,{expiresIn:"20m"})
};

const generateRefreshToken=(user)=>{
    return jwt.sign({id:user._id},process.env.refresh_token_secret,{expiresIn:"24h"})
}

const generateOtp=()=>{
    return Math.floor(100000 + Math.random() * 900000).toString()
} 




const client=new OAuth2Client(process.env.CLIENT_ID)


const sendOtp=async(req,res)=>{
    try {
        const {email}=req.body;
        console.log(email)
     
        if(!email){
            return res.status(409).json({success:false,message:"no email found"})
        }
        const existUser=await userModel.findOne({email});
        if(existUser){
            return res.status(409).json({success:false,message:"email already exist"})
        }
        const otp=generateOtp();

        const verificationId = crypto.randomBytes(16).toString('hex');
        await OtpVerificationModel.findOneAndDelete({email})

        const newOtpVerification=new OtpVerificationModel({
            email,
            otp,
            verificationId:verificationId
        })
       await newOtpVerification.save()

    // Set up transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user:process.env.EMAIL_ID ,
      pass: process.env.PASSWORD, 
    },
  });
  
  // Set up mail options
  const mailOptions = {
    from: "junaid.sheikh.1800@gmail.com",
    to: email,
    subject: "email verification code",
    text:  `Your OTP code is: ${otp}`,
    html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #333;">Your OTP Code</h2>
      <p style="font-size: 18px;">Use the following OTP to verify your email:</p>
      <div style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #1a73e8;">${otp}</div>
      <p>This OTP will be valid for 10 minutes.</p>
       <p>Do not share this OTP with anyone. If you didn't make this request, you can safely ignore this email.
EASY DIALYSIS will never contact you about this email or ask for any login codes or links. Beware of phishing scams.</p>
      
      <h3>Thanks for connecting with us</h3>
      <h2>EASY DIALYSIS</h2>
    </div>
  `,
  };
  
  // Send email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Error: ", error);
    } else {
      console.log("Email sent: " + info.response);
      return res.json({success:true,verificationId,info})
    }
  });
    

   
      
    } catch (error) {
        console.log(error)
        return error
    }
}


const verifyOtp=async(req,res)=>{
    try {
        const {otp}=req.body;
        const {VerificationId}=req.body
        console.log(otp,VerificationId)
        if(!otp){
            return res.status(409).json({message:"otp is required"})
        }

        const otpRecord=await OtpVerificationModel.findOne({verificationId:VerificationId})
        if(!otpRecord){
            return res.status(404).json({success:false,message:"not found"})
        }
        if(otpRecord.otp !== otp){
            return res.status(401).json({success:false,message:"incorrect otp retry again"})
        }
        return res.status(200).json({success:true,message:"otp verification success",otpRecord})

    } catch (error) {
        return error
    }
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
            return res.status(409).json({success:false,message:"email already exist"})
        }

        const hashedpassword=await bcrypt.hash(password,10)

        const newuser= new userModel({
            username,
            password:hashedpassword,
            email,
            authMethord:"local"
        })

        await newuser.save()

        console.log(newuser)
        return res.status(201).json({success:true,message:"user created succesfully",data:newuser})
    } catch (error) {
        return error.response
    }
}

const googleAuth=async(req,res)=>{
    try {
        const {credential}=req.body;

        console.log(credential)
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.CLIENT_ID
          });

          const details=ticket.getPayload();
          const { email, name, picture, sub } = details;

          let user=await userModel.findOne({email})
          if(!user){
            user=new userModel({
                username:name,
                email,
                googleId:sub,
                profilePicture:picture,
                authMethord:"google"
            })
           await user.save()
          }else if(user.status===false){
              return res.json({success:false,message:"user is blocked"})
          }else if(!user.googleId){
              user.googleId=sub;
              user.authMethord=user.authMethord === 'local' ? "both" :"google";
              user.profilePicture=picture
              await user.save()
          }

          const accessToken=generateAccessToken(user)
        const refreshToken=generateRefreshToken(user)
        
        res.cookie("refreshToken", refreshToken, {
            httpOnly:true,
            secure: true,
            maxAge:  24 * 60 * 60 * 1000, 
            sameSite: "none", 
            domain: "easydialysis-frontend.vercel.app",
        });
        res.cookie("accesstoken", accessToken, {
            httpOnly:true,
            secure: true,
            maxAge: 24* 60 * 60 * 1000, 
            sameSite: "none", 
            domain: "easydialysis-frontend.vercel.app",
        });

       return res.json({success:true,message:"authentication succesfull",user,accessToken,refreshToken})
    } catch (error) {
        console.log(error)
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
        if(existuser.authMethord=='google'){
            return res.json({success:false,message:"user already signed in using google",googleUser:true})
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
            sameSite: "none", 
            domain: "https://easydialysis-frontend.vercel.app"
        });
        res.cookie("accesstoken", accessToken, {
            httpOnly:true,
            secure: true,
            maxAge: 24* 60 * 60 * 1000, 
            sameSite: "none", 
            domain: "https://easydialysis-frontend.vercel.app"
        });
       
    
         
        return res.json({success:true,message:"login success",user:existuser,accessToken,refreshToken})
    } catch (error) {
       return error
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
        const dialysisCenters=await  DialysisCenterModel.find({Status:"active"});

        res.json({success:true,dialysisCenters,message:"details fetched succesfully"})
        console.log(dialysisCenters)
    } catch (error) {
        console.log(error)
    }
}


const makePayment=async(req,res)=>{
    const userid=req.userid
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
                            name: data.CenterName, 
                        },
                        unit_amount: Math.round(data.price ), 
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
                userId:userid
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
            console.log("session in save payment-----------  ;",session)

            const newBooking=new bookingModel({
                dialysisCenterId:session.metadata.dialysisCenterId,
                appoinmentDate:new Date(session.metadata.appointmentDate),
                appoinmentTime:session.metadata.appoinmentTime,
                userId:session.metadata.userId,
                paymentStatus:"success",
                bookingStatus:"pending",
                paymentAmount:session.amount_total,
                stripePaymentId:session.id,
                paymentTime:new Date(),
                
                
            })

            await newBooking.save()

            console.log("new booking  :",newBooking)
        }


    } catch (error) {
        console.log(error)
    }
}

const getBookingDetails=async(req,res)=>{
    const {session_id}=req.query;
    console.log("session_id  :",  session_id)
    try {
        const BookingData=await bookingModel.find({stripePaymentId:session_id}).populate("dialysisCenterId")
        if(!BookingData){
            return res.json({success:false,message:"no booking data found"})
        }
        return res.json({success:true,message:"booking data found",BookingData})
    } catch (error) {
        console.log(error)
    }
    return res.json({session_id})
}

const myBookings=async(req,res)=>{
    const userid=req.userid;
    try {
        const myBookingData=await bookingModel.find({userId:userid}).populate('dialysisCenterId')

        console.log(myBookingData,"my booking data")
        if(!myBookingData || myBookingData.length==0){
            return res.json({success:false,message:"no booking data found"})
        }
        const formattedBookings = myBookingData.map(booking => ({
            ...booking.toObject(), 
            appoinmentDate: booking.appoinmentDate.toISOString().split("T")[0] // Extract only YYYY-MM-DD
        }));
        console.log(formattedBookings)
        return res.json({success:true,myBookingData:formattedBookings})
    } catch (error) {
        
    }
}
const cancelBooking=async(req,res)=>{
    try {
        const userid=req.userid;
        const {appoinmentId}=req.body
        const appoinmentData=await bookingModel.findById(appoinmentId);
        if(!appoinmentData){
            return res.json({success:false,message:"no appoinment found"})
        }
        if(appoinmentData.userId.toString() !== userid.toString()){
            return res.json({success:false,message:"not authorized"})
        }
        const updatedAppointment = await bookingModel.findByIdAndUpdate(
            appoinmentId,
            { 
              bookingStatus: 'cancelled', 
              appoinmentCancel: true,
              cancelledAt: new Date() // Adding timestamp of when it was cancelled
            },
            { new: true } // Returns the updated document
          );
          return res.json({success:true,message:"appoinment cancelled succesfully",updatedAppointment})
    } catch (error) {
        console.log(error)
    }
}









export {register,Login,refreshAccessToken,getUserdata,logout,allDialysisCenter,makePayment,savePayment,getBookingDetails,myBookings,cancelBooking,googleAuth,sendOtp,verifyOtp}