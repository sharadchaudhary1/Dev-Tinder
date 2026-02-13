
const express=require("express")
const UserAuth=require("../middleware/auth")
const ConnectionRequestModel = require("../models/connectionRequest")
const UserModel=require("../models/user")


const router=express.Router()

router.post('/save/:status/:toUserId',UserAuth,async(req,res)=>{

    try{

        const fromUserId=req.user._id;
        const toUserId=req.params.toUserId;
        const status=req.params.status

        if(fromUserId==toUserId){
            throw new Error("user can't send a connection request to itself")
        }

        const allowedStatus=["ignored","interested"]

        if(!allowedStatus.includes(status)){
            return res.status(400).send("Invalid status")
        }
    
        const connectionRequest=new ConnectionRequestModel({
            fromUserId,
            toUserId,
            status
        })
               
        const userExist=await UserModel.findById(toUserId)

        if(!userExist){
            throw new Error("ERROR: you are trying to make a connection with Invalid user Id")
        }
 
        const existingConnection=await ConnectionRequestModel.findOne({
            $or:[
                {fromUserId,toUserId},
                {fromUserId:toUserId,toUserId:fromUserId}
            ]
        })

        if(existingConnection){
            throw new Error("cannot make connection  request .request already in progress")
        }
          
        else{

            const data=await connectionRequest.save()
            res.send("connection request sent successfully",data)
        }
    }catch(err){
          res.status(500).send(err.message)
    }

})


module.exports=router