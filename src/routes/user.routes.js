const express = require('express');
const router =new express.Router();
const { UserRegister , UserLogin} = require('../controllers/AuthController')
const {getFiles } = require('../controllers/User.controller')


// Register Route 
router.post('/api/v1/user/register' , UserRegister)

// User Login Route 
router.post('/api/v1/user/login', UserLogin);


// upload records route
// router.post('/api/v1/user/upload-records' , uploadToSpecificFolder)


// get files route 
router.get('/api/v1/user/all-records' ,getFiles)

module.exports = router