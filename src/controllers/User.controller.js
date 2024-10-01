const fs = require('fs');
const path = require('path');
const User = require('../models/user.model')
const Record = require('../models/record.model')
const multer = require('multer');




// Upload docs 
// const uploadToSpecificFolder = async (req, res) => {
//     try {
//       const { userId, farmerName, khasraNumber, villageName, mobileNumber, dateOfRegistration, plotNumber } = req.body;
//       console.log(userId, "userId");
//       console.log(farmerName, "farmerName");
//       console.log(req.file)


//       const user = await User.findOne({ id: userId });
//       if (!user) {
//         return res.status(400).json({ message: 'User not found!' });
//       }
  
//       const cdnRootDir = path.join(__dirname, '../cdn');
//       const userFolder = path.join(cdnRootDir, user.id);
//       if (!fs.existsSync(userFolder)) {
//         fs.mkdirSync(userFolder, { recursive: true });
//       }
  
//       const storage = multer.diskStorage({
//         destination: function (req, file, cb) {
//           cb(null, userFolder); // Set destination to the user's folder
//         },
//         filename: function (req, file, cb) {
//           const uniqueName = `${Date.now()}-${file.originalname}`; // Generate unique file name
//           cb(null, uniqueName);
//         }
//       });
  
//       const upload = multer({ storage }).single('document'); // Single file upload
//       upload(req, res, async function (err) {
//         if (err) {
//           return res.status(500).json({ message: 'File upload failed!', error: err.message });
//         }
  
//         const newRecord = new Record({
//           filePath: path.join('/cdn', user.id, req.file.filename), // Save the file path
//           farmerName,
//           khasraNumber,
//           villageName,
//           mobileNumber,
//           dateOfRegistration,
//           plotNumber,
//           uploadedBy: user._id // Associate with the user
//         });
  
//         await newRecord.save();
  
//         return res.status(200).json({
//           message: 'File uploaded and record saved successfully!',
//           filePath: path.join('/cdn', user.id, req.file.filename), // Return file path
//           record: newRecord
//         });
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: 'Server error during file upload and record saving.', error: error.message });
//     }
//   };




const getFiles = async(req,res)=>{
    try {
        const { userId } = req.params;

    
        const user = await User.findOne({ uniqueId: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

       
        const records = await Record.find({ uploadedBy: user._id });

        if (records.length === 0) {
            return res.status(404).json({ message: 'No files uploaded by this user.' });
        }

       
        res.status(200).json({
            message: `Files uploaded by user ${user.uniqueId}`,
            files: records
        });
    } catch (error) {
        console.error('Error fetching user files:', error);
        res.status(500).json({ message: 'Server error while fetching user files.' });
    }
}














module.exports  = {
      getFiles
}