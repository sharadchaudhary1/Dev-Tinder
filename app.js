const express = require("express");
const connectDb = require("./src/config/database");
const UserModel = require("./src/models/user");
const bcrypt=require('bcrypt')
const cookieParser=require("cookie-parser")
const jwt=require("jsonwebtoken")
const userAuth=require("./src/middleware/auth")

const validateUserData=require('./src/helper/user')

const app = express();


app.use(express.json());
app.use(cookieParser())

const startServer = async () => {
  try {
    await connectDb();
    console.log("database connected successfully");
    app.listen(3000, () => {
      console.log("server is running on port 3000");
    });
  } catch (err) {
    console.log("database not connected", err);
    process.exit(1);
  }
};

startServer();

app.post("/signup", async (req, res) => {
  
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
    console.log(err.message);
    res
      .status(400)
      .send("Internal server ERROR",err.message);
  }
});


app.post('/login',async(req,res)=>{

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
  
    res.cookie('token',token)
    res.status(200).send("user logged in successfully")
  }

})


app.get('/profile',userAuth,async(req,res)=>{

  try{

       res.send(req.user)
    
  }catch(err){
    res.status(401).send(err.message)
  }
})

app.get("/user", async (req, res) => {
  const email = req.body.email;

  try {
    const users = await UserModel.findOne({ email:email });

    if (!users) {
      res.status(404).send("No user exist with this email id");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(401).send("something went wrong");
  }
});



app.delete('/user',async(req,res)=>{

    const userId=req.body.id

    try{
        
      await UserModel.findByIdAndDelete(userId)

        res.send("Deleted user successfully")

    }catch(err){
            res.send("something went wrong")
    }
})



app.patch('/user/:userId',async(req,res)=>{

    const userId=req.params?.userId;



    try{
          const update_allowed=["firstname","lastname","age","skills","about"]
           
          const isUpdateAllowed=Object.keys(req.body).every((k)=>{
           return update_allowed.includes(k)
          })

          if(!isUpdateAllowed){
           res.status(400).send("some fields are not updated")
          }

          else{

              const updatedUser=await UserModel.findByIdAndUpdate({ _id:userId},req.body,{new:true,runValidators:true})
               console.log(updatedUser)
              if(!updatedUser){
                  res.status(404).send("user is not found")
              }
              res.send("user details updated")
          }

    }catch(err){
        console.log(err.message)
        res.status(400).send("something went wrong")
    }
})