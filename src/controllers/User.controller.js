const fs = require('fs');
const path = require('path');
const User = require('../models/user.model')
const Record = require('../models/record.model')
const multer = require('multer');




// Upload docs 

// const uploadToSpecificFolder = async (req, res) => {
//     try {
//         const { userId, farmerName, khasraNumber, villageName, mobileNumber, dateOfRegistration, plotNumber } = req.body; 
//           console.log(userId)
//           console.log(farmerName , "farmerName")
     
//         const user = await User.findOne({ id: userId });
//         if (!user) {
//             return res.status(400).json({ message: 'User not found!' });
//         }

//         const cdnRootDir = path.join(__dirname, '../cdn');  
//         const userFolder = path.join(cdnRootDir, user.id);
//         if (!fs.existsSync(userFolder)) {
//             fs.mkdirSync(userFolder, { recursive: true });  
//         }

//         const storage = multer.diskStorage({
//             destination: function (req, file, cb) {
//                 cb(null, userFolder);  
//             },
//             filename: function (req, file, cb) {
//                 const uniqueName = `${Date.now()}-${file.originalname}`;  
//                 cb(null, uniqueName);
//             }
//         });

//         const upload = multer({ storage }).single('document');
//         upload(req, res, async function (err) {
//             if (err) {
//                 return res.status(500).json({ message: 'File upload failed!', error: err.message });
//             }
//             const newRecord = new Record({
//                 filePath: path.join('/cdn', user.id, req.file.filename),  
//                 farmerName,
//                 khasraNumber,
//                 villageName,
//                 mobileNumber,
//                 dateOfRegistration,
//                 plotNumber,
//                 uploadedBy: user._id  
//             });

           
//             await newRecord.save();

            
//             return res.status(200).json({
//                 message: 'File uploaded and record saved successfully!',
//                 filePath: path.join('/cdn', user.uniqueId, req.file.filename),
//                 record: newRecord  
//             });
//         });
//     } catch (error) {
//           console.log(error)
//         res.status(500).json({ message: 'Server error during file upload and record saving.', error: error.message });
//     }
// };

const uploadToSpecificFolder = async (req, res) => {
    try {
        const { userId, farmerName, khasraNumber, villageName, mobileNumber, dateOfRegistration, plotNumber } = req.body; 

        console.log('userId:', userId);  // Debugging userId

        // Fetch the user based on the provided userId
        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(400).json({ message: 'User not found!' });
        }

        // Create user-specific folder inside CDN if it doesn't exist
        const cdnRootDir = path.join(__dirname, '../cdn');
        const userFolder = path.join(cdnRootDir, user.id);
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }

        // Configure Multer storage with user-specific folder
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, userFolder);
            },
            filename: function (req, file, cb) {
                const uniqueName = `${Date.now()}-${file.originalname}`;
                cb(null, uniqueName);
            }
        });

        // Define Multer upload middleware
        const upload = multer({ storage }).single('document');

        // Now, use the upload middleware
        upload(req, res, async function (err) {
            if (err) {
                return res.status(500).json({ message: 'File upload failed!', error: err.message });
            }

            // File uploaded successfully, now save the record in MongoDB
            const newRecord = new Record({
                filePath: path.join('/cdn', user.id, req.file.filename),
                farmerName,
                khasraNumber,
                villageName,
                mobileNumber,
                dateOfRegistration,
                plotNumber,
                uploadedBy: user._id
            });

            // Save the record to the database
            await newRecord.save();

            // Return success response with the file path and record details
            return res.status(200).json({
                message: 'File uploaded and record saved successfully!',
                filePath: path.join('/cdn', user.id, req.file.filename),
                record: newRecord
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during file upload and record saving.', error: error.message });
    }
};









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
     uploadToSpecificFolder , getFiles
}