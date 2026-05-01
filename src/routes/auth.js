
const express=require("express")
const bcrypt=require("bcrypt")
const validateUserData=require("../helper/validate")
const jwt=require("jsonwebtoken")
const UserModel=require("../models/user")
require("dotenv").config();



const router=express.Router()

router.post("/register", async (req, res) => {
  
    validateUserData(req)
   
    const {firstname,lastname,email,skills,age,gender,about,password,profilePicture,images}=req.body

  const passwordhash=await bcrypt.hash(password,10)
   

   const newUser={
    firstname:firstname,
    lastname:lastname,
    email:email,
    skills:skills,
    password:passwordhash,
    age:age,
    gender:gender,
    about:about,
    profilePicture,
    images
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
       
    console.log(err.message)
    res
      .status(400)
      .send("Internal server ERROR",err.message);
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(401).send("Invalid credentials");
  }

  const validpassword = await bcrypt.compare(password, user.password);

  if (!validpassword) {
    return res.status(401).send("Invalid credentials");
  }

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    expires: new Date(Date.now() + 24 * 3600000)
  });

  res.status(200).send(user);
});


router.post("/logout", async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    expires: new Date(0)
  });

  res.send("logged out successfully");
});

module.exports=router;