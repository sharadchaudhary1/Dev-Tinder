const jwt=require("jsonwebtoken")
const UserModel=require("../models/user")

const userAuth=async(req,res,next)=>{
    
    try{

        const cookies=req.cookies; 
        if(!cookies){
            throw new Error("First authenticate yourself")
        }
    
        const {token}= cookies;
         if(!token){
            throw new Error("No existing token first  login with credentials ")
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
    }catch(err){
        res.status(400).send(err.message)
    }
}


module.exports=userAuth;




