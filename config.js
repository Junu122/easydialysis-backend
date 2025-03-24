import mongoose from "mongoose";


export const DBconnection=async()=>{
    await mongoose.connect(process.env.data_base_url).then(()=>{
        console.log("database connected")
    }).catch((err)=>{
       console.log(err,"error occured")
    })
}