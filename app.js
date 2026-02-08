
const express=require("express")

const app=express();




app.get("/login",(req,res,next)=>{
    console.log("you are about to login")
    next()
    res.send("sending a response from the server")
        console.log("code after next")
}
, (req,res)=>{
    console.log("you are in the secon route hendler of login")
    res.send("response 2")
}

)


app.post("/profile",(req,res)=>{
    res.send("you are on the profile page")
})

app.use("/user",(req,res)=>{
    res.send("get all the users ")
})

app.use("/", (req,res)=>{
    console.log(" you are handle all route")
    res.send("handle all http request")
})



app.listen(3000 ,()=>{
    console.log("server is running on port 3000")
})