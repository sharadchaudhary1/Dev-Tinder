const express = require("express");
const connectDb = require("./src/config/database");
const UserModel = require("./src/models/user");

const app = express();

app.use(express.json());

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


  //this (new keyword) will create a new instance inside a model
  const user = new UserModel(req.body);

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
      .send("there is some error when saving a data into a database");
  }
});

app.get("/user", async (req, res) => {
  const eamil = req.body.email;

  try {
    const users = await UserModel.findOne({ email:email });

    if (!users) {
      res.status(404).send("No user exist with this email id");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(401).send("semething went wrong");
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