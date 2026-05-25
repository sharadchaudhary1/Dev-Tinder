
const express=require("express")
const userAuth=require("../middleware/auth")
const ConnectionRequestModel=require("../models/connectionRequest")
const UserModel=require("../models/user")


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

     

        res.send(data)
    }
    catch(err){
        console.log(err.message)
        res.status(500).send("ERROR:" + err.message)
    }

})


router.get('/feed',userAuth,async(req,res)=>{
  
    try{

        loggedInUser=req.user
    
        const connectionUsers=await ConnectionRequestModel.find({
            $or:[
                {fromUserId:loggedInUser._id},
                {toUserId:loggedInUser._id}
            ]
        }).select(["fromUserId", "toUserId"])
    
          
        const hideUsersFromFeed=new Set()
    
        connectionUsers.forEach(user=> {
            hideUsersFromFeed.add(user.fromUserId.toString());
            hideUsersFromFeed.add(user.toUserId.toString())
        })
    
        // const page=1;
        // const limit=2;
    
        const users=await UserModel.find({
            $and:[
                
                { _id:{$nin:Array.from(hideUsersFromFeed)}},
                {_id :{$ne:loggedInUser._id}}
            ]
        }).select(["firstname","lastname","age","gender","skills","about","profilePicture","images"])
        // .skip((page-1)*limit).limit(limit)
    
        
    res.send(users)
    }
    catch(err){
        console.log("Error in fetching a feed ",err.message)
        res.status(500).send("Error"+err.message)
    }


})



router.get('/chat/:id',userAuth,async(req,res)=>{
    
    try{

        const {id}=req.params
     
         if(!id) return res.status(400).send("please provide a id of user")
     
         const user =await UserModel.findById(id).select(["firstname","lastname","skills","age","gender","about","profilePicture"])
     
         if(!user) return res.status(404).send("user not found with this id")
     
             return res.status(200).send(user)
    }
    catch(err){
        console.log(err.message)
    }

})

module.exports=router;