const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Admin = require("../models/admin.model")


const auth = async (req, res, next) => {
    if (!req.header("Authorization")) {
      return   res.status(401).send({ error: "Unauthorized Access!!, No Access Token present in the request." });
    }
    const token = req.header("Authorization").replace("Bearer ", "");
 
    console.log(token , "tken")
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       console.log(decoded)
      
        let user = await User.findOne({ _id: decoded._id });

      
        if (!user) {
            user = await Admin.findOne({ _id: decoded._id });
        }

     
      
        if (!user) {
            res.status(401).send({ error: "Unauthorized Access!!  You are not permitted to access the route" });
        }

        req.token = token;
        req.user = user;
        next(); 
    } catch (err) {
        // console.log(err)
        res.status(401).send({ error: "Unauthorized Access!!, No Access Token present in the request." });
    }
};

module.exports = auth;