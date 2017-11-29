const mongoose = require('mongoose');

// Schema
const articleSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author:{
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    }
});

// export
const article = module.exports = mongoose.model('Article', articleSchema);