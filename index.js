import express from "express";
import cors from "cors";
import { DBconnection } from "./config.js";
import userrouter from "./routers/USER/userRouter.js";
import adminRouter from "./routers/ADMIN/adminRouter.js";
import cookieParser from 'cookie-parser';
import  "dotenv/config";

const app=express()
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://easydialysis-frontend.vercel.app");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });

app.use(cors({
    origin: 'https://easydialysis-frontend.vercel.app',
    credentials:true,
    
}))

app.use(cookieParser());

// app.use(express.json())
app.use((req, res, next) => {
    if (req.originalUrl === '/api/auth/stripe-webhook') {
        next(); // Skip body parsing for the webhook route
    } else {
        express.json()(req, res, next); // Apply express.json() to all other routes
    }
});

app.use(express.urlencoded({extended:false}))

app.set('view engine', 'ejs')

DBconnection()

app.use('/api/auth',userrouter)
app.use('/api/admin',adminRouter)



const PORT=process.env.PORT
app.listen(PORT,()=>{
    console.log("server is running on port",PORT)
})