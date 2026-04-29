
const mongoose=require("mongoose")
const validator=require("validator")

const userSchema=new mongoose.Schema({
    firstname:{
        type:String,
        required:[true,"firstname is required"],
        minlength:[3,"firstname should be minlength 3"],
        maxlength:[50,"firstname not more than 50 character"]
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

    images: {
        type: [String],
        default: [],
        validate: {
            validator: function(value) {
                return Array.isArray(value) && value.every(img => validator.isURL(img))
            },
            message: "All images must be valid URLs"
        }
    },
    profilePicture: {
        type: String,
        default: null,
        validate: {
            validator: function(value) {
                if (value === null) return true
                return validator.isURL(value)
            },
            message: "Profile picture must be a valid URL"
        }
    }
    
},{
    timestamps:true
}

)


module.exports=mongoose.model("user",userSchema)

