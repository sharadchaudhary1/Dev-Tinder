const jwt=require("jsonwebtoken")
const UserModel=require("../models/user")

const userAuth=async(req,res,next)=>{

    const cookies=req.cookies; 
    if(!cookies){
        throw new Error("First authenticate yourself")
    }

    const {token}= cookies;
     if(!token){
        throw new Error("first go  to login page ")
     }
    

   const decodedtoken=jwt.verify(token,"jaat");

   const user=await UserModel.findOne({_id:decodedtoken._id})

   if(!user){
    throw new Error("No user exist with given information first registered a user")
   }

   else {

    req.user=user;
    next()
   }
}


module.exports=userAuth;




