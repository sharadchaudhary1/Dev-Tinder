
const mongoose=require("mongoose")

const connectionRequestSchema=mongoose.Schema({

    fromUserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    toUserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },

    status:{
    type:String,
    enum:{
        values:["ignored","interested","accepted","rejected"],
        message:`Enter a valid status`
    },
    required:true,
    default:"interested"
    }

},
{
    timestamps:true
}
)

connectionRequestSchema.index({fromUserId:1,toUserId:1})
module.exports=mongoose.model("connectionRequest",connectionRequestSchema)