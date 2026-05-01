
const socket=require("socket.io")
const crypto =require("crypto")
const ChatModel=require("../models/chat")


const CreateSecretRoomId=(userId,targetUserId)=>{

    return crypto.createHash("sha256").update([userId,targetUserId].sort().join("$")).digest("hex")
}

const initializeSocket=(server)=>{
  
    
    const io= socket(server,{
    cors: {
      origin: [
        "http://localhost:5173",
        "https://truebond-six.vercel.app"
      ],
    
      credentials: true
    }
    })
    
    io.on("connection",(socket)=>{
     
    socket.on("joinChat",({userId,targetUserId})=>{
     
        const roomId=CreateSecretRoomId(userId,targetUserId)

        socket.join(roomId)
      
    })


    socket.on("sendMessage",async({userId,targetUserId,senderId,text})=>{

         const roomId=CreateSecretRoomId(userId,targetUserId)
       
       try{

        let chat=await ChatModel.findOne({
            particpants:{$all:[userId,targetUserId]}
        })

        if(!chat){
            chat=new ChatModel({
            particpants:[userId,targetUserId],
            messages:[]
            })
        }

        chat.messages.push({
            senderId:userId,
            text
        })


        await chat.save()

       }catch(err){
          console.log(err.message)
       }

         io.to(roomId).emit("messageReceived",{userId:targetUserId,senderId,text})
    })

    socket.on("disconnect",()=>{})

    })

}

module.exports=initializeSocket;