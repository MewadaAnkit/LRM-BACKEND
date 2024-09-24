const express = require('express');
const router =new express.Router();
const { AdminRegister} = require('../controllers/AuthController')





// Admin Regitration Route 
router.post('/api/v1/admin/register' , AdminRegister)










module.exports  = router