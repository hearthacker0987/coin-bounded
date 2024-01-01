const mongoose = require('mongoose')

// const Schema = mongoose.Schema

// Another why to destructure 
const {Schema} = mongoose

const blogSchema = new Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    photoUrl: {type: String, required: true},
    slug: {type: String, required: true},
    author: {type: mongoose.SchemaTypes.ObjectId, ref : "User"}  
    //referance will be the name of model name => its a relationship between two collection  

},{
    timestamps: true
})

module.exports = mongoose.model('Blog',blogSchema,'blogs')