const express = require("express");
const connectDb = require("./src/config/database");
const UserModel = require("./src/models/user");

const cookieParser=require("cookie-parser")


const authRouter=require("./src/routes/auth")
const profileRouter=require("./src/routes/profile")

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

app.use('/auth',authRouter)
app.use('/profile',profileRouter)









