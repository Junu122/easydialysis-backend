import jwt from "jsonwebtoken";

const VerifyAccessToken=(req,res,next)=>{
  const accessToken=req.cookies.accessToken;
  
  if(!accessToken){
   return res.status(401).json({success:false,message:"no accesstoken  found"})
  }
  try {
    const decodedtoken=jwt.verify(accessToken,process.env.access_token_secret)
    req.userid=decodedtoken.id;
    next()
  } catch (error) {

    if(error.name === 'TokenExpiredError'){
      return res.status(401).json({ message: "Token expired" });
    }
    
    console.log(error)
  }
}

const verifyAdminToken=(req,res,next)=>{
  const adminToken=req.cookies.adminToken;

  if(!adminToken){
    return res.status(401).json({success:false,message:"no token available not authorized"})
  }

  try {
    const decodedToken=jwt.verify(adminToken,process.env.access_token_secret)
    req.adminId=decodedToken.id
    next()
  } catch (error) {
    if(error.name === 'TokenExpiredError'){
      return res.status(401).json({ message: "Token expired" });
    }
    console.log(error)
  }
}


export {VerifyAccessToken,verifyAdminToken}
