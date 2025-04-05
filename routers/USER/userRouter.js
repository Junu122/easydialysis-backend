import express from "express"
import { register,Login,refreshAccessToken,getUserdata,logout,allDialysisCenter,makePayment,savePayment ,getBookingDetails,myBookings,cancelBooking} from "../../controllers/userController.js"
import { VerifyAccessToken } from "../../middlewares/authMidlleware.js"


const userrouter=express.Router()


userrouter.post('/register',register)
userrouter.post('/login',Login)
userrouter.get('/refreshaccesstoken',refreshAccessToken)
userrouter.get('/userdata',VerifyAccessToken,getUserdata)
userrouter.post('/logout',logout)
userrouter.get('/dialysis-centers',allDialysisCenter)
userrouter.post('/make-payment',VerifyAccessToken,makePayment)
userrouter.post('/stripe-webhook',express.raw({ type: "application/json" }),savePayment)
userrouter.get('/booking-details',getBookingDetails)
userrouter.get('/my-bookings',VerifyAccessToken,myBookings)
userrouter.put('/cancel-booking',VerifyAccessToken,cancelBooking)

export default userrouter