
const express=require("express")
const bcrypt=require("bcrypt")
const validateUserData=require("../helper/user")
const jwt=require("jsonwebtoken")
const UserModel=require("../models/user")

const router=express.Router()

router.post("/signup", async (req, res) => {
  
    validateUserData(req)
   
    const {firstname,lastname,email,skills,age,gender,about,password}=req.body

  const passwordhash=await bcrypt.hash(password,10)
   

   const newUser={
    firstname:firstname,
    lastname:lastname,
    email:email,
    skills:skills,
    password:passwordhash,
    age:age,
    gender:gender,
    about:about

   }

  //this (new keyword) will create a new instance inside a model
  const user = new UserModel(newUser);

  try {
    const userexist=await UserModel.findOne({email:user.email})
    if(userexist){
        res.status(409).send("user already exist")
    }
    else{

        await user.save();
        res.send("user saved successfully in database");
    }
  } catch (err) {
   
    res
      .status(400)
      .send("Internal server ERROR",err.message);
  }
});


router.post('/login',async(req,res)=>{

  const {email,password}=req.body;

  if(!email || !password){
    res.status(400).send("Email and password are required")
  }

  const user= await UserModel.findOne({email:email})
   
  if(!user){
    res.status(401).send("email and password are unauthorized")
  }

  const validpassword=await bcrypt.compare(password,user.password)

  if(!validpassword){
    res.status(401).send("unauthorized")
  }

  else {
      
    const token=jwt.sign({_id:user._id},"jaat",{expiresIn:'1h'})
  
    res.cookie('token',token,{
        expires:new Date(Date.now() + 24*3600000)
    })
    res.status(200).send("user logged in successfully")
  }

})



router.post("/logout",async(req,res)=>{

    res.cookie("token",null,{
        expires:new Date(Date.now())
    })
    res.send("logged out successfully")
})

module.exports=router;