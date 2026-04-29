
const mongoose=require("mongoose")
  

const messageSchema=new mongoose.Schema({

    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    text:{
        type:String,
        required:true
    }

},{timestamps:true})




const chatSchema=new mongoose.Schema({

 particpants: [
    {type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
],
 messages:[messageSchema]

})



const chat=mongoose.model("chat",chatSchema)

module.exports=chat;