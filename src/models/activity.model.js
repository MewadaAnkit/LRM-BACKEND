const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Assuming you have User model
        ref: 'User',
       
    },
    action: {
        type: String,
       
    },
    description: {
        type: String,
      
    },
    timestamp: {
        type: String,
        default: Date.now
    }
} ,{timestamps:true});

const Activity = mongoose.model('ActivityLog', activityLogSchema);
module.exports = Activity