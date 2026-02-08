
const express=require("express")

const app=express();




app.use("/login",(req,res)=>{
    res.send("sending a response from the server")
})


app.use("/profile",(req,res)=>{
    res.send("you are on the profile page")
})

app.use("/user",(req,res)=>{
    res.send("get all the users ")
})

app.use((req,res)=>{
    res.send("handle all http request")
})



app.listen(3000 ,()=>{
    console.log("server is running on port 3000")
})