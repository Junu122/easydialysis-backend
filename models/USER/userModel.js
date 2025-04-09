import mongoose from "mongoose";


const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required: function() {
            return this.authMethod === 'local' || this.authMethod === 'both';
          }
    },
    usertoken:{
        type:String,
        default:null

    },
    status:{
        type:Boolean,
        default:true
    },
    authMethord:{
        type: String,
        enum: ['local', 'google', 'both'],
        default: 'local'
    },
    googleId: {
        type: String,
        sparse: true 
      },
    profilePicture: {
        type: String,
        default: ''
      },
    createdAt: {
        type: Date,
        default: Date.now
      }
})

export const userModel=mongoose.model("users",userSchema)