const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    filePath: String,  
    farmerName: String,
    khasraNumber: String,
    villageName: String,
    mobileNumber: String,
    dateOfRegistration: Date,
    plotNumber: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  
    uploadDate: { type: Date, default: Date.now }  
});

const Record = mongoose.model('Records', documentSchema);

module.exports = Record;