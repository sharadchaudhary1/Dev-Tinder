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
    await user.save();
    res.send("user saved successfully in database");
  } catch (err) {
    console.log(err.message);
    res
      .status(400)
      .send("there is some error when saving a data into a database");
  }
});

app.get("/user", async (req, res) => {
  const lastname = req.body.lastname;

  try {
    const users = await UserModel.find({ lastname: lastname });

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



app.patch('/user',async(req,res)=>{

    const userId=req.body.id;



    try{
        const updatedUser=await UserModel.findByIdAndUpdate({ _id:userId},req.body,{returnDocument:"after"})
         console.log(updatedUser)
        if(!updatedUser){
            res.status(404).send("user is not found")
        }
        res.send("user details updated")
    }catch(err){
        res.status(400).send("something went wrong")
    }
})