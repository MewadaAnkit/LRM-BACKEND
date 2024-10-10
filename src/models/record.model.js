const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    id:{type:String},
   registry_papers: String,  
    other_docs: String,  
    farmerName: String,
    farmerMobile:String,
    farmerEmail:String,
    buyerName:String,
    khasraNumber: String,
    villageName: String,
    dateOfRegistration: String,
    plotNumber: String,
    lastUpdateBy:{type:String},
    lastUpdateDate:{type:String},
    uploadedBy: { type:String},  
    uploadDate: { type: String }  
},{timestamps:true});

const Record = mongoose.model('Records', documentSchema);

module.exports = Record;