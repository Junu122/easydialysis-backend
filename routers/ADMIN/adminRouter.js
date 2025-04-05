import express from 'express'
import { addDialysisCenter,adminLogin,adminLogout,getAdmin,updateCenter,getAppoinments,deleteCenter,updateAppoinment,getUsers,updateUser,allDialysisCenter } from '../../controllers/adminController.js'
import { verifyAdminToken } from '../../middlewares/authMidlleware.js'
const adminRouter=express.Router()


adminRouter.post('/add-dialysis-center',verifyAdminToken,addDialysisCenter)
adminRouter.post('/admin-login',adminLogin)
adminRouter.post('/admin-logout',adminLogout)
adminRouter.get('/get-admin',verifyAdminToken,getAdmin)
adminRouter.put('/update-center/:centerid',verifyAdminToken,updateCenter)
adminRouter.get('/get-appoinments',verifyAdminToken,getAppoinments)
adminRouter.delete('/delete-center/:id',verifyAdminToken,deleteCenter)
adminRouter.put('/update-appoinment/:id',verifyAdminToken,updateAppoinment)
adminRouter.get('/Users',verifyAdminToken,getUsers)
adminRouter.put('/update-user/:id',verifyAdminToken,updateUser)
adminRouter.get('/dialysis-centers',verifyAdminToken,allDialysisCenter)
export default adminRouter