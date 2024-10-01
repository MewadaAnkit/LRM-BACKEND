const ActivityLog = require('../models/activity.model');

const logActivity = async (userId, action, description) => {
    try {
        const newLog = new ActivityLog({
            userId,
            action,
            description
        });
        await newLog.save();
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

module.exports = logActivity;