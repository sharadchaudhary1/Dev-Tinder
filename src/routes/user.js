
const express=require("express")
const userAuth=require("../middleware/auth")
const ConnectionRequestModel=require("../models/connectionRequest")


const router=express.Router()

router.get('/request/recieved',userAuth,async(req,res)=>{

    try{

        loggedInUser=req.user;

        const allRequest=await ConnectionRequestModel.find({
            toUserId:loggedInUser._id,
            status:"interested"
        }).populate("fromUserId",["firstname","lastname","age","skills","gender","about"])

      

        res.send(allRequest)

    }catch(err){
        res.status(500).send("ERROR:"+ err.message)
    }

})


router.get('/connections',userAuth,async(req,res)=>{

    try{

        const loggedInUser=req.user;

        const connections=await ConnectionRequestModel.find({
            $or:[
                {fromUserId:loggedInUser._id,status:"accepted"},
                {toUserId:loggedInUser._id,status:"accepted"}
            ]
        }).populate("fromUserId",["firstname","lastname","age","gender","skills","about"])
        .populate("toUserId",["firstname","lastname","age","gender","skills","about"])

        const data=connections.map(user=>{
            if(loggedInUser._id.toString()===user.fromUserId._id.toString()){
                return user.toUserId
            }
            return user.fromUserId
        })

        console.log(data)

        res.send("show all connection of user")
    }
    catch(err){
        console.log(err.message)
        res.status(500).send("ERROR:" + err.message)
    }

})


module.exports=router;