import express from 'express'
import { addDialysisCenter,adminLogin,adminLogout,getAdmin,updateCenter } from '../../controllers/adminController.js'
import { verifyAdminToken } from '../../middlewares/authMidlleware.js'
const adminRouter=express.Router()


adminRouter.post('/add-dialysis-center',verifyAdminToken,addDialysisCenter)
adminRouter.post('/admin-login',adminLogin)
adminRouter.post('/admin-logout',adminLogout)
adminRouter.get('/get-admin',verifyAdminToken,getAdmin)
adminRouter.put('/update-center/:centerid',verifyAdminToken,updateCenter)

export default adminRouter