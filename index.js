import express from "express";
import cors from "cors";
import { DBconnection } from "./config.js";
import userrouter from "./routers/userRouter.js";
import cookieParser from 'cookie-parser'
import  "dotenv/config"

const app=express()
const PORT=4000;

app.use(cors())
app.use(cookieParser());

app.use(express.json())

app.use(express.urlencoded({extended:false}))

app.set('view engine', 'ejs')

DBconnection()

app.use('/api/auth',userrouter)

app.listen(PORT,()=>{
    console.log("server is running on port",PORT)
})