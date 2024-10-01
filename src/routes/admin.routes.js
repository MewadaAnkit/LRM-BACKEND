const express = require('express');
const router = new express.Router();
const { AdminRegister } = require('../controllers/AuthController')
const Record = require('../models/record.model')
const User = require('../models/user.model')
const multer = require('multer')
const fs = require('fs');
const path = require('path');


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





const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });



router.post('/upload', upload.fields([
  { name: 'registry_papers', maxCount: 1 },
  { name: 'adhaar_card_farmer', maxCount: 1 },
  { name: 'agreement_papers', maxCount: 1 },
  { name: 'khasra_book', maxCount: 1 }
]), async (req, res, next) => {

  const { userId, userName } = req.body;

  if (!userId || !userName) {
    return res.status(400).json({ message: 'User ID and User Name are required!' });
  }

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
      id: recordId, // Generated record ID
      file1Path: `/cdn/${recordId}/registry_papers.pdf`,
      file2Path: `/cdn/${recordId}/adhaar_card_farmer.pdf`,
      file3Path: `/cdn/${recordId}/agreement_papers.pdf`,
      file4Path: `/cdn/${recordId}/khasra_book.pdf`,
      uploadedBy: req.body.userId,
      userName: req.body.userName,
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














router.get('/api/records', async (req, res) => {

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

    const filePaths = records.map(record => ({
      recordId: record.id,
      // farmerName:farmerName,
      file1Path: record.file1Path,
      file2Path: record.file2Path,
      file3Path: record.file3Path,
      file4Path: record.file4Path,
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
        if (record.file1Path) {
          files.push({
            name: 'file1',
            url: `${baseUrl}${record.file1Path}`,
            type: path.extname(record.file1Path).replace('.', '')
          });
        }
        if (record.file2Path) {
          files.push({
            name: 'file2',
            url: `${baseUrl}${record.file2Path}`,
            type: path.extname(record.file2Path).replace('.', '')
          });
        }
        if (record.file3Path) {
          files.push({
            name: 'file3',
            url: `${baseUrl}${record.file3Path}`,
            type: path.extname(record.file3Path).replace('.', '')
          });
        }
        if (record.file4Path) {
          files.push({
            name: 'file4',
            url: `${baseUrl}${record.file4Path}`,
            type: path.extname(record.file4Path).replace('.', '')
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
    { name: 'adhaar_card_farmer', maxCount: 1 },
    { name: 'agreement_papers', maxCount: 1 },
    { name: 'khasra_book', maxCount: 1 }
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
        uploadedBy: req.body.userId,
        userName: req.body.userName,
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
  
      if (req.files['agreement_papers']) {
        const agreementPaper = req.files['agreement_papers'][0];
        const agreementFileName = `agreement_papers${path.extname(agreementPaper.originalname)}`;
        fs.writeFileSync(path.join(uploadPath, agreementFileName), agreementPaper.buffer);
        updateData.file3Path = `/cdn/${recordId}/${agreementFileName}`;
      }
  
      if (req.files['khasra_book']) {
        const khasraBook = req.files['khasra_book'][0];
        const khasraFileName = `khasra_book${path.extname(khasraBook.originalname)}`;
        fs.writeFileSync(path.join(uploadPath, khasraFileName), khasraBook.buffer);
        updateData.file4Path = `/cdn/${recordId}/${khasraFileName}`;
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


















module.exports = router