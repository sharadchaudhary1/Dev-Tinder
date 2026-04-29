
const validator=require("validator")

function validateUserData(req){
    
    const {firstname,email,age,skills,password}=req.body;

    if(!firstname){
        throw new Error ("firstname is required")
    }

    if(!email){
        throw new Error ("Email is required for register ")
    }

    if(!password){
         throw new Error ("password is required")
    }

    if(!age){
         throw new Error ("please enter the age for complete the registration")
    }
    
    if(!validator.isEmail(email)){
         throw new Error ("Enter a valid email")
    }

    if(!validator.isStrongPassword(password)){
         throw new Error ("please enter a strong password")
    }

    if(age<18){
         throw new Error ("Age should be minimum 18")
    }

    if (firstname.length < 3) {
    throw new Error("firstname should be minimum 3 characters");
}

if(skills.length>10){
    throw new Error("Skills not more than 10");
}
    
}


module.exports=validateUserData;