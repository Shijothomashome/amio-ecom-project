const mongoose = require('mongoose');

// creating schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Firstname is required']
    },
    lastName: {
        type: String,
        required: [true, 'Lastname is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    phoneNumber: {
        type: Number,
        required: [true, 'Phone number is required']
    },
    password: {
        type: String, 
        required: [true, 'Set your password']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    blocked : {
        type: Boolean,
        default: false
    }

});

// creating collection using the created schema
const userCollection = mongoose.model('userCollection', userSchema);

module.exports = userCollection; // exported to commonController
