const mongoose = require("mongoose")

async function connectDB(){
    try{
        await mongoose.connect(process.env.DB)
    }catch(err){
        console.log(err)
    }
}

module.exports = connectDB