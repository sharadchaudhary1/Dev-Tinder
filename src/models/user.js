
const mongoose=require("mongoose")
const validator=require("validator")

const userSchema=new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
             throw new Error("Email is not valid")
            }
        }

    },
    password:{
        type:String,
        required:true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Enter a Strong password")
            }
        }
    },
    age:{
        type:Number,
        min:[18,"age must be at least 18"]
    },
    gender:{
        type:String,
       
    },
    skills:{
        type:[String],
       
    },

    about:{
        type:String,
        default:"i am a software engineer"
    },
    
},{
    timestamps:true
}

)


module.exports=mongoose.model("user",userSchema)

