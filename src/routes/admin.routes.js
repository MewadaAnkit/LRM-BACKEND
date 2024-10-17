const express = require('express');
const router = new express.Router();
const { AdminRegister } = require('../controllers/AuthController')
const Record = require('../models/record.model')
const User = require('../models/user.model')
const multer = require('multer')
const fs = require('fs');
const path = require('path');
const { Search , deleteRecord, CheckUser ,DeletUR, GetAllEmploye , getMetrics, editPermision ,deletPermision } = require('../controllers/admin.controller')

const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};



// Admin Regitration Route 
router.post('/api/v1/admin/register', AdminRegister)


// admin 
router.get("/api/auth/currentUser" , CheckUser)

// all users
router.get('/api/admin/all-users',GetAllEmploye)


// get metrics 
router.get('/api/admin/get-metrics',getMetrics)


// permision
router.post('/api/admin/update-permision', deletPermision)

router.post('/api/admin/update-permision2', editPermision)


router.delete('/api/admin/delete-user', DeletUR)


router.delete('/api/admin/delete-record', deleteRecord)







const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });



router.post('/api/v1/add-record', upload.fields([
  { name: 'registry_papers', maxCount: 1 },
  { name: 'other_docs', maxCount: 1 },
 
]), async (req, res, next) => {

  const { userId, farmerName,farmerMobile,farmerEmail } = req.body;

  try {
   
    const lastRecord = await Record.findOne().sort({ createdAt: -1 }).exec();

    let newId = 'REC001'; 

    if (lastRecord && lastRecord.id) {
    
      const lastNumericId = parseInt(lastRecord.id.replace('REC', ''), 10);

    
      newId = `REC${String(lastNumericId + 1).padStart(3, '0')}`; 
    }

    // Create folder based on the generated recordId
    const uploadPath = path.join(__dirname, `../../cdn/${newId}`);
    fs.mkdirSync(uploadPath, { recursive: true }); 

    req.uploadPath = uploadPath;
    req.newRecordId = newId; 

    next();

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error generating record ID or creating folder' });
  }
}, async (req, res) => {

  const uploadPath = req.uploadPath;
  const recordId = req.newRecordId; 

  Object.keys(req.files).forEach(fieldName => {
    const file = req.files[fieldName][0];
    const fileExtension = path.extname(file.originalname);
    const fileName = `${fieldName}${fileExtension}`;

    fs.writeFileSync(path.join(uploadPath, fileName), file.buffer);
  });
                        
  try {
  
    const newRecord = new Record({
      id: recordId,
      registry_papers: `/cdn/${recordId}/registry_papers.pdf`,
      other_docs: `/cdn/${recordId}/other_docs.pdf`,
      uploadedBy: req.body.userId,
      farmerName: req.body.farmerName,
      farmerEmail: req.body.farmerEmail || null,
      farmerMobile: req.body.farmerMobile,
      buyerName: req.body.buyerName,
      khasraNumber: req.body.khasraNumber,
      villageName: req.body.villageName,
      plotNumber:req.body.plotNumber,
      dateOfRegistration:req.body.dateOfRegistration,
      lastUpdateBy:"",
      lastUpdateDate:"",
      uploadDate: formatDate(new Date()), 
    });

   
    await newRecord.save();

   
    res.status(200).json({
      message: 'Files uploaded successfully!',
      
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to upload files and save record', error: error.message });
  }
});







   


router.get('/api/v1/admin/records', async (req, res) => {

  try {

    const records = await Record.find();

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







router.get('/api/records/detail', async (req, res) => {
  const { recordId } = req.query;

  try {
    const filter = {}; // Initialize filter object

    // Add filters based on query parameters
    if (recordId) {
      filter.id = recordId; // Filter by recordId
    }

    
    const records = await Record.find(filter);

    // If no records found
    if (records.length === 0) {
      return res.status(404).json({ message: 'No records found' });
    }

  //  let uploadedBy = await User.find({id:records.uploadedBy})
    
  //  if(!uploadedBy && uploadedBy===null){
  //   uploadedBy = await Admin.find({id:records.uploadedBy})
  //  } 

    console.log(uploadedBy , "uploadedBy ")
    const filePaths = records.map(record => ({
      _id : record._id,
      recordId: record.id,
       farmerName:record.farmerName,
       buyerName:record.buyerName,
       villageName:record.villageName,
       khasraNumber:record.khasraNumber,
       farmerMobile:record.farmerMobile,
       farmerEmail:record.farmerEmail,
      plotNumber: record.plotNumber,
      dateOfRegistration:record.dateOfRegistration,
      registry_papers: record.registry_papers,
      other_docs: record.other_docs,
      uploadedBy: record.uploadedBy,
      uploadDate: record.uploadDate,
    }));

    res.status(200).json({ filePaths });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch records', error: error.message });
  }
});




router.get('/api/records/doc', async (req, res) => {
  const { recordId } = req.query;

  try {
    const filter = {}; 

    if (recordId) {
      filter.id = recordId;

      // Fetch records based on the filter
      const records = await Record.find(filter);

      // If no records found
      if (records.length === 0) {
        return res.status(404).json({ message: 'No records found' });
      }

      // Define the base URL for the CDN
      const baseUrl = 'http://localhost:8000';

    
      const filePaths = records.map(record => {
        const files = [];
        if (record.registry_papers) {
          files.push({
            name: 'registry_papers',
            url: `${baseUrl}${record.registry_papers}`,
            type: path.extname(record.registry_papers).replace('.', '')
          });
        }
        if (record.other_docs) {
          files.push({
            name: 'other_docs',
            url: `${baseUrl}${record.other_docs}`,
            type: path.extname(record.other_docs).replace('.', '')
          });
        }
      
        return files;
      });


      const flattenedFilePaths = filePaths.flat();

      res.status(200).json(flattenedFilePaths);
    }
    
    }catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch records', error: error.message });
    }
  });






  router.put('/update/:recordId', upload.fields([
    { name: 'registry_papers', maxCount: 1 },
    { name: 'other_docs', maxCount: 1 },
    
  ]), async (req, res) => {
  
    const { recordId } = req.params;
    const { userId, userName } = req.body;
  
    if (!userId || !userName) {
      return res.status(400).json({ message: 'User ID and User Name are required!' });
    }
  
    try {
      // Find the existing record by recordId
      const existingRecord = await Record.findOne({ id: recordId });
  
      if (!existingRecord) {
        return res.status(404).json({ message: 'Record not found!' });
      }
  
      const uploadPath = path.join(__dirname, `../../cdn/${recordId}`);
      
      // Ensure the upload directory exists
      if (!fs.existsSync(uploadPath)) {
        return res.status(500).json({ message: 'Directory for record does not exist!' });
      }
  
      const updateData = {
       
        userName: req.body.userName,
        lastUpdateBy:req.body.userId,
        uploadDate: formatDate(new Date()), 
      };
  
      // Update only the specific documents that are being uploaded by the user
      if (req.files['registry_papers']) {
        const registryPaper = req.files['registry_papers'][0];
        const registryFileName = `registry_papers${path.extname(registryPaper.originalname)}`;
        fs.writeFileSync(path.join(uploadPath, registryFileName), registryPaper.buffer);
        updateData.file1Path = `/cdn/${recordId}/${registryFileName}`;
      }
  
      if (req.files['adhaar_card_farmer']) {
        const adhaarCard = req.files['adhaar_card_farmer'][0];
        const adhaarFileName = `adhaar_card_farmer${path.extname(adhaarCard.originalname)}`;
        fs.writeFileSync(path.join(uploadPath, adhaarFileName), adhaarCard.buffer);
        updateData.file2Path = `/cdn/${recordId}/${adhaarFileName}`;
      }
  
     
  
      // Update the record in the database with only the new data
      const updatedRecord = await Record.findOneAndUpdate({ id: recordId }, updateData, { new: true });
  
      if (!updatedRecord) {
        return res.status(404).json({ message: 'Record not found for update!' });
      }
  
      res.status(200).json({
        message: 'Record updated successfully!',
        updatedRecord
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update record', error: error.message });
    }
  });


  router.put('/update/:recordId', upload.fields([
    { name: 'registry_papers', maxCount: 1 },
    { name: 'other_docs', maxCount: 1 },
]), async (req, res) => {

    const { recordId } = req.params;
    const { userId, userName } = req.body;

    if (!userId || !userName) {
        return res.status(400).json({ message: 'User ID and User Name are required!' });
    }

    try {
        // Find the existing record by recordId
        const existingRecord = await Record.findOne({ id: recordId });

        if (!existingRecord) {
            return res.status(404).json({ message: 'Record not found!' });
        }

        const uploadPath = path.join(__dirname, `../../cdn/${recordId}`);

        // Ensure the upload directory exists
        if (!fs.existsSync(uploadPath)) {
            return res.status(500).json({ message: 'Directory for record does not exist!' });
        }

        // Create updateData object with only the fields passed in the request body
        const updateData = {};

       
        if (req.body.farmerName) updateData.farmerName = req.body.farmerName;
        if (req.body.farmerMobile) updateData.farmerMobile = req.body.farmerMobile;
        if (req.body.farmerEmail) updateData.farmerEmail = req.body.farmerEmail;
        if (req.body.buyerName) updateData.buyerName = req.body.buyerName;
        if (req.body.khasraNumber) updateData.khasraNumber = req.body.khasraNumber;
        if (req.body.villageName) updateData.villageName = req.body.villageName;
       
        if (req.body.dateOfRegistration) updateData.dateOfRegistration = req.body.dateOfRegistration;
        if (req.body.plotNumber) updateData.plotNumber = req.body.plotNumber;

        updateData.lastUpdateBy = req.body.userId;
        updateData.lastUpdateDate = formatDate(new Date());
        updateData.uploadDate = formatDate(new Date());

        // Handle file updates if they exist
        if (req.files['registry_papers']) {
            const registryPaper = req.files['registry_papers'][0];
            const registryFileName = `registry_papers${path.extname(registryPaper.originalname)}`;
            fs.writeFileSync(path.join(uploadPath, registryFileName), registryPaper.buffer);
            updateData.registry_papers = `/cdn/${recordId}/${registryFileName}`;
        }

        if (req.files['other_docs']) {
            const otherDoc = req.files['other_docs'][0];
            const otherFileName = `other_docs${path.extname(otherDoc.originalname)}`;
            fs.writeFileSync(path.join(uploadPath, otherFileName), otherDoc.buffer);
            updateData.other_docs = `/cdn/${recordId}/${otherFileName}`;
        }

        // Update only the fields that are passed, others remain unchanged
        const updatedRecord = await Record.findOneAndUpdate({ id: recordId }, { $set: updateData }, { new: true });

        if (!updatedRecord) {
            return res.status(404).json({ message: 'Record not found for update!' });
        }

        res.status(200).json({
            message: 'Record updated successfully!',
            updatedRecord
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update record', error: error.message });
    }
});











// search api 
router.get('/api/v1/admin/search', Search);



module.exports = router