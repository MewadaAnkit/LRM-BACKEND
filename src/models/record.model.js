const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    id:{type:String},
    file1Path: String,  
    file2Path: String,  
    file3Path: String,  
    file4Path: String,  
    farmerName: String,
    farmerMobile:String,
    farmerEmail:String,
    buyerName:String,
    buyerMobile:String,
    khasraNumber: String,
    villageName: String,
    mobileNumber: String,
    dateOfRegistration: Date,
    plotNumber: String,
    uploadedBy: { type:String},  
    uploadDate: { type: String }  
},{timestamps:true});

const Record = mongoose.model('Records', documentSchema);

module.exports = Record;