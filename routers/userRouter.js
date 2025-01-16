import express from "express"
import { register,Login } from "../controllers/userController.js"

const userrouter=express.Router()


userrouter.post('/register',register)
userrouter.post('/login',Login)

export default userrouter