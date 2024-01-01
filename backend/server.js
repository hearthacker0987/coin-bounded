const express = require('express');

const {PORT} = require('./config/index')
const dbConnect = require('./database/index')
const router = require('./routes/index')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const app = express();

app.use(express.json());    //our application accept the json formate data
app.use(cookieParser());
app.use(router)
dbConnect()
// app.get('/',(req,res) => res.json({msg: "Hello World! This is new yes"}))

// this is middleware => its allow storage folder in statically means its show publicaly 
app.use('/storage',express.static('storage'))

app.use(errorHandler)
app.listen(PORT,console.log(`Backend is running on port: ${PORT}`));