const dotenv = require('dotenv').config();

const PORT = process.env.PORT

const CONNECTION_STRING = process.env.CONNECTION_STRING;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const SERVER_BASEURL = process.env.SERVER_BASEURL

module.exports = {
    PORT,
    CONNECTION_STRING,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    SERVER_BASEURL
}