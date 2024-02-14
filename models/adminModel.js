// this model is used only for creating admin collection in the database
const mongoose = require('mongoose');
const adminCollection = mongoose.model('adminCollection', { name: String, email: String, password: String });
module.exports = adminCollection;