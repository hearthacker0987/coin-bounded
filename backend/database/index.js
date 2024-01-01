const mongoose = require('mongoose')

const {CONNECTION_STRING} = require('../config/index')

// const CONNECTION_STRING = "mongodb+srv://moin:moin1234@cluster0.wbiil8f.mongodb.net/coin-bounce?retryWrites=true&w=majority";

const dbConnect = async () => {


    try{
        const conn  = await mongoose.connect(CONNECTION_STRING);
        console.log(`Database is connected to host: ${conn.connection.host}`)
    }
    catch(error){
        console.log(`Error: ${error}`)
    }

}

module.exports = dbConnect