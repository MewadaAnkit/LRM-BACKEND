const User = require('../models/user.model')
const jwt = require('jsonwebtoken')
const Admin = require('../models/admin.model.js')

const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

const UserRegister = async (req, res) => {
    try {
        const { username, email, password, firstname, lastname, mobile, city, state, } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        const existingMobile = await User.findOne({ mobile });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        } if (existingMobile) {
            return res.status(400).json({ message: 'User already exists with this mobile.' });
        }

        // Generate a sequential ID for the user
        const lastUser = await User.findOne().sort({ id: -1 });  // Find the last user based on the 'id' field
        let newId = 'UR001';  // Default ID if no users exist

        if (lastUser && lastUser.id) {
            // Extract the numeric part from the last user's ID
            const lastIdNumber = parseInt(lastUser.id.replace('UR', ''));
            const nextIdNumber = lastIdNumber + 1;
            // Generate the new ID (e.g., UR001, UR002, etc.)
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
            date_created:formatDate(new Date()),
            role: "user",
            active:true
        });

        // Save the user to the database
        await newUser.save();

        // Send response
        res.status(201).json({ message: 'User registered successfully!', newUser:newUser });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Error registering user. Please try again later.' });
    }
}



// Login COntroller for user 
// const UserLogin = async (req, res) => {
//     try {
//         const { mobile, password } = req.body;

//         // Check if the user exists by mobile number
//         const user = await User.findOne({ mobile, password });
//         if (!user) {
//             return res.status(400).json({ message: 'Invalid mobile number or password.' });
//         }

//         // Generate JWT token (you can include any relevant user data in the payload)
//         const token = jwt.sign(
//             {
//                 id: user.id,         
//                 username: user.username,
//                 mobile: user.mobile
//             },
//             process.env.JWT_SECRET,
//             { expiresIn: '1h' }  
//         );

//         const userdata = {
//             token: token,
//             userId: user._id,
//             id: user.id,
//             role: user.role,
//             username: user.username
//         }
//         // Send back token and user info
//         res.status(200).json({
//             message: 'Login successful!',
//            userdata
//         });
//     } catch (error) {
//         console.error('Error during login:', error);
//         res.status(500).json({ message: 'Login failed. Please try again later.' });
//     }
// }

const UserLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        
        const isMobile = /^[0-9]{10}$/.test(username);
        console.log(isMobile)
        let user1;

        if (isMobile) {
            // If it's a mobile number, perform User login
            user1 = await User.findOne({ mobile: username , password});
            if (!user1) {
                return res.status(400).json({ message: 'Invalid mobile number or password.' });
            }
        } else {
            // If it's not a mobile number, perform Admin login (by username)
            user1 = await Admin.findOne({ username: username , password });
            if (!user1) {
                return res.status(400).json({ message: 'Invalid username or password.' });
            }
        }

       
        const token = jwt.sign(
            {
                id: user1.id,    
                _id:user1._id,     
                username: user1.username,
                mobile: user1.mobile,
                role: user1.role     
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }  // Token expires in 1 hour
        );

        // Prepare response data
        const userdata = {
            token: token,
            _id: user1._id,
            id: user1.id,
            role: user1.role,
            username: user1.username
        };

        // Send back token and user info
        res.status(200).json({
            message: 'Login successful!',
            user:userdata
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Login failed. Please try again later.' });
    }
};













// Admin Register 

const AdminRegister = async (req, res) => {
    try {
        const { username, email, password, name, mobile, } = req.body;

        // Check if the user already exists
        const existingUser = await Admin.findOne({ email });
        const existingMobile = await Admin.findOne({ mobile });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        } if (existingMobile) {
            return res.status(400).json({ message: 'User already exists with this mobile.' });
        }

        // Generate a sequential ID for the user
        const lastUser = await Admin.findOne().sort({ id: -1 });  // Find the last user based on the 'id' field
        let newId = 'AD001'; 

        if (lastUser && lastUser.id) {
            // Extract the numeric part from the last user's ID
            const lastIdNumber = parseInt(lastUser.id.replace('AD', ''));
            const nextIdNumber = lastIdNumber + 1;
            // Generate the new ID (e.g., UR001, UR002, etc.)
            newId = 'AD' + nextIdNumber.toString().padStart(3, '0');  // Ensure it's always 3 digits
        }

        // Hash the password
        // const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user object
        const newUser = new Admin({
            id: newId,
            username,
            email,
            password:password,
            name,
            mobile,
           
            date_created:formatDate(new Date()),
            role: "admin"
        });

        // Save the user to the database
        await newUser.save();

        // Send response
        res.status(201).json({ message: 'User registered successfully!', userId: newUser.id });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Error registering user. Please try again later.' });
    }
}



// Login COntroller for user 























module.exports = { UserRegister , UserLogin , AdminRegister}