require('dotenv').config()
const express = require('express');
const app = express();
const PORT = 8000|| process.env.PORT
const connectDB = require('./src/utils/connection.js')
const cors = require('cors');
const cookieParser = require('cookie-parser')
const UserRoutes = require('./src/routes/user.routes.js')
const AdminRoutes = require('./src/routes/admin.routes.js')
const bodyParser = require('body-parser')
//Middlewares
app.use(cors({
    origin : process.env.FRONTEND_URL,
    credentials : true
}))


app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(cookieParser())




//routes

app.use(UserRoutes)
app.use(AdminRoutes)


// database connection 
connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log("connnect to DB")
        console.log("Server is running "+PORT)
    })
})
