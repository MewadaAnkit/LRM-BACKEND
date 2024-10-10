const User  = require('../models/user.model')
const Record  = require('../models/record.model')

const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };



// controller to create user 


const UserRegister = async (req, res) => {
    try {
        const { username, email, password, firstname, lastname, mobile, city, state, village } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        const existingMobile = await User.findOne({ mobile });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        } if (existingMobile) {
            return res.status(400).json({ message: 'User already exists with this mobile.' });
        }

       
        const lastUser = await User.findOne().sort({ id: -1 });  
        let newId = 'UR001';  
        if (lastUser && lastUser.id) {
            
            const lastIdNumber = parseInt(lastUser.id.replace('UR', ''));
            const nextIdNumber = lastIdNumber + 1;
      
            newId = 'UR' + nextIdNumber.toString().padStart(3, '0');  // Ensure it's always 3 digits
        }

        // Hash the password
        // const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user object
        const newUser = new User({
            id: newId,
            username,
            email,
            password:password,
            firstname,
            lastname,
            mobile,
            city,
            state,
            village,
            date_created:formatDate(new Date()),
            role: "legal_team"
        });

        // Save the user to the database
        await newUser.save();

        // Send response
        res.status(201).json({ message: 'User created successfully!', userId: newUser.id });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Error registering user. Please try again later.' });
    }
}


// get All employes aur users 
const  GetAllEmploye = async(req,res)=>{
    try{
        const emp = await User.find({active:true});
      if(!emp){
         return res.status(401).json({message:"Data not found"})
      }

        res.status(200).json({message:"Employee Found ",status:200 , Data:emp })

    }catch(error){
        console.log(error)
        res.status(500).json({Error:"Internal Server Error" })
    }
}


// delete user 
const DeletUR = async(req,res)=>{
    try {
        const userId = req.params.id;
        const deletedUser = await User.findOneAndDelete({ id: userId });

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found!' });
        }

        return res.status(200).json({ message: 'User deleted successfully!' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
}



// Deactive UR
const Deactivate = async(req,res)=>{
    try {
        const userId = req.params.id;
        // const { active } = req.body;  // Pass the new active status in the request body

        const updatedUser = await User.findOneAndUpdate(
            { id: userId }, 
            { active:false },  // Update the 'active' field
            { new: true }  // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found!' });
        }

        return res.status(200).json({
            message: 'User active status updated successfully!',
            user: updatedUser
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating user status', error: error.message });
    }
}





// Reactive UR
const Reactivate = async(req,res)=>{
    try {
        const userId = req.params.id;
        // const { active } = req.body;  // Pass the new active status in the request body

        const updatedUser = await User.findOneAndUpdate(
            { id: userId }, 
            { active:true },  // Update the 'active' field
            { new: true }  // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found!' });
        }

        return res.status(200).json({
            message: 'User active status updated successfully!',
            user: updatedUser
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating user status', error: error.message });
    }
}




// User Metrics 
const getMetrics = async (req, res) => {
    try {
      const totalDocs = await Record.countDocuments();
      const recentDocs = await Record.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
      const totalUsers = await User.countDocuments();
  
      res.json({ totalDocs, recentDocs, totalUsers });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching metrics', error });
    }
  };




// delete records 
const deleteRecord = async (req, res) => {
    try {
        const { id } = req.params; 

        
        const deletedRecord = await Record.findByIdAndDelete(id);

        if (!deletedRecord) {
            return res.status(404).json({ message: 'Record not found' });
        }

      
        return res.status(200).json({
            message: 'Record deleted successfully',
            data: deletedRecord
        });
    } catch (error) {
       
        return res.status(500).json({
            message: 'An error occurred while deleting the record',
            error: error.message
        });
    }
};









const Search = async(req,res)=>{
    try {
        const { searchQuery } = req.query;
    
   
        if (!searchQuery) {
          return res.status(200).json([]);
        }
    
       
        const regex = new RegExp(searchQuery, 'i'); 
       
        const query = {
          $or: [
            { farmerName: regex },
            { khasraNumber: regex },
            { villageName: regex },
            { farmerMobile: regex },
            { plotNumber: regex }
          ]
        };
    
       
        const records = await Record.find(query);
    
      
        res.status(200).json(records);
      } catch (error) {
        res.status(500).json({ message: 'Error searching documents', error });
      }
}













module.exports = {Search}