const mongoose = require("mongoose");



const adminSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            
        },
        name: {
            type: String,
            
        },
        email: {
            type: String,
           
        },
        username: {
            type: String,
           
        },
        date_created: {
            type: String,
        },
        active: {
            type: Boolean,
            default:true
        },
        edit_option: {
            type: Boolean,
            defaut:true
        },
        download_option: {
            type: Boolean,
            default:true
        },
        mobile: {
            type: String,
        },
        password: {
            type: String,
        },
      role:{
        type:String
      }
    },
    { timestamps: true }
);

const Admin = mongoose.model('admin', adminSchema)

module.exports = Admin 