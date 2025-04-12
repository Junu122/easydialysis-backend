import express from "express";
import cors from "cors";
import { DBconnection } from "./config.js";
import userrouter from "./routers/USER/userRouter.js";
import adminRouter from "./routers/ADMIN/adminRouter.js";
import cookieParser from 'cookie-parser';
import  "dotenv/config";

const app=express()


app.use(cors({
    origin: 'https://easydialysis.shop',
    credentials:true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
    
}))

app.options('*', cors());

app.use(cookieParser());

// app.use(express.json())
app.use((req, res, next) => {
    if (req.originalUrl === '/auth/stripe-webhook') {
        next(); // Skip body parsing for the webhook route
    } else {
        express.json()(req, res, next); // Apply express.json() to all other routes
    }
});

app.use(express.urlencoded({extended:false}))

app.set('view engine', 'ejs')

DBconnection()

app.use('/auth',userrouter)
app.use('/admin',adminRouter)



const PORT=process.env.PORT
app.listen(PORT,()=>{
    console.log("server is running on port",PORT)
})