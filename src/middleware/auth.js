const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;


    if (!token) {
      return res.status(401).send("Please login first");
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded._id);

   
    if (!user) {
      return res.status(404).send("User not found");
    }


    req.user = user;
    next();

  } catch (err) {
    console.error("Auth error:", err.message);

    return res.status(401).send("Invalid or expired token");
  }
};

module.exports = userAuth;
