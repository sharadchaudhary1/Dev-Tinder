
const mongoose=require("mongoose")


const connectDb=async ()=>{
    await mongoose.connect("mongodb+srv://sharadc983_db_user:tahvSWO4u2pkKUYS@devtinder.icheasj.mongodb.net/?appName=devTinder")
}

module.exports=connectDb;



