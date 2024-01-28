// imports admin collection for accessing it here in the callbacks (controllers)
const adminCollection = require('../models/adminModel');

// sets new admin into the database
const setAdmin = async (req, res) => {
    const check = await adminCollection.find({});

    if (check.length === 0) {
        const data = {
            name: 'shijo',
            userName: 'admin@gmail.com',
            password: 1234
        };
        await new adminCollection(data).save();
        res.send('Admin set successfully...');
    } else {
        res.send("you don't have the access to this page...");
    }
}

module.exports = {
    setAdmin
}