import mongoose from "mongoose";


export const DBconnection=async()=>{
    await mongoose.connect('mongodb+srv://junaid:junu1800@cluster0.grd8k.mongodb.net/easydialysis').then(()=>{
        console.log("database connected")
    }).catch((err)=>{
       console.log(err,"error occured")
    })
}