const express=require("express")
const router=express.Router()
const userAuth=require("../middleware/auth")
const UserModel=require("../models/user")
const bcrypt=require("bcrypt")
const validator=require("validator")

router.get('/get',userAuth,async(req,res)=>{

  try{

       res.send(req.user)
    
  }catch(err){
    res.status(401).send(err.message)
  }
})


router.patch("/update", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

   
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided for update"
      });
    }

  
    const allowedUpdates = ["firstname", "lastname", "age", "skills",  "about", "gender","profilePicture","images" ];

   
    const isValidUpdate = Object.keys(req.body).every((field) =>
      allowedUpdates.includes(field)
    );

    if (!isValidUpdate) {
      return res.status(400).json({
        success: false,
        message: "Invalid update fields"
      });
    }

    
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

   
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });

  } catch (err) {
    console.error("Update error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Server error while updating profile"
    });
  }
});



router.delete('/delete',userAuth,async(req,res)=>{

    const {_id}=req.user

    try{
        if(!_id){
            throw new Error("you are not authenticated ")
        }
        
        console.log(_id)

     const deletedUser= await UserModel.findByIdAndDelete(_id)
            
     if(!deletedUser){
    res.status(404).send("no user exist with this id")
     }
     else
     {
         res.clearCookie("token")
         res.send(" user Deleted successfully")
     }

    }catch(err){
            res.send(err.message)
    }
})


router.patch('/passwordupdate',userAuth,async(req,res)=>{

    const {_id}=req.user
       
    const {oldPassword,newPassword,confirmPassword}=req.body
    
    try{

        const{password}=req.user
        console.log(password)
    
        const isEqual=await bcrypt.compare(oldPassword,password)
    
         if(!isEqual){
            throw new Error("Enter a correct password ")
         }
    
         else{
           if(!validator.isStrongPassword(newPassword)){
            throw new Error("Please enter a Strong new password")
           }
    
           if(newPassword!==confirmPassword){
            throw new Error("Password mismatch!")
           }
         }

         const passwordHash=await bcrypt.hash(newPassword,10)
    
         const Passwordobj={
            password:passwordHash
         }

         console.log(Passwordobj)
    
        const updatedPassword=await UserModel.findByIdAndUpdate({_id:_id},Passwordobj,{new:true})
    
        if(!updatedPassword){
            throw new Error("some error during updation of password")
        }
        else{
            res.cookie("token",null,{
                expires:new Date(Date.now())
            })
            res.send("password is updated")
        }
    }catch(err){
        console.log(err.message)
        res.status(500).send(err.message)
    }

})


module.exports=router;