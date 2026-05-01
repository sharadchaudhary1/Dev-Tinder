const express = require("express");
const connectDb = require("./src/config/database");
const UserModel = require("./src/models/user");
const http=require("http")

const cookieParser=require("cookie-parser")
require("dotenv").config();


const authRouter=require("./src/routes/auth")
const profileRouter=require("./src/routes/profile")
const requestRouter=require("./src/routes/request")
const userRouter=require("./src/routes/user")
const chatRouter=require("./src/routes/chat")
const cors=require("cors");
const initializeSocket = require("./src/helper/socket");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://truebond-six.vercel.app/"
  ],
  credentials: true
}));


app.use(express.json());
app.use(cookieParser())

const server = http.createServer(app)

initializeSocket(server)



const startServer = async () => {
  try {
    await connectDb();
    console.log("database connected successfully");
    server.listen(3000, () => {
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

app.use('/request',requestRouter)

app.use('/user',userRouter)

app.use('/chats',chatRouter)





