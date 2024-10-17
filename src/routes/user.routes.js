const express = require('express');
const router =new express.Router();
const { UserRegister , UserLogin} = require('../controllers/AuthController')
const {getFiles, UserById , getMetrics } = require('../controllers/User.controller')
const Record = require('../models/record.model')

// Register Route 
router.post('/api/v1/user/register' , UserRegister)

// User Login Route 
router.post('/api/v1/user/login', UserLogin);


// upload records route
// router.post('/api/v1/user/upload-records' , uploadToSpecificFolder)


// get files route 
router.get('/api/v1/user/all-records' ,getFiles)

// user by id 
router.get('/api/v1/admin/user-details',UserById)


// metrics 
router.get('/api/v1/legal/get-metrics', getMetrics)











router.get('/api/v1/user/records', async (req, res) => {
     const {id} = req.query
    try {
      console.log(id,"id")
      const records = await Record.find({uploadedBy:id});
  
      // If no records found
      if (records.length === 0) {
        return res.status(404).json({ message: 'No records found' });
      }
  
  
  
      res.status(200).json({ record: records });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch records', error: error.message });
    }
  });




module.exports = router