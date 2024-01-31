const userCollection = require('../models/userModel');
const bcrypt = require('bcrypt');
const validator = require('validator');


const getSignup = (req, res) => {
    res.render('signup');
}

const postSignup = async (req, res) => {
    try {
        const existingEmail = await userCollection.findOne({ email: req.body.email });
        const existingPhoneNumber = await userCollection.findOne({ phoneNumber: req.body.phoneNumber });
        if (existingEmail) {
            res.render('signup', {message: 'Email is already registered!', class:'alert-danger', firstName: req.body.firstName, lastName: req.body.lastName, phoneNumber: req.body.phoneNumber, password: req.body.password, rePassword: req.body.rePassword, EmailBorderColor: 'border-danger' });
        } else if (existingPhoneNumber) {
            res.render('signup', {message: 'Mobile number is already registered!', class:'alert-danger',  firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, password: req.body.password, rePassword: req.body.rePassword, MobileBorderColor: 'border-danger' });
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            req.body.password = hashedPassword;
            delete req.body.rePassword;   // no need use this line here because, in the schema we haven't used rePassword, but try to understand that we can delete a field from req.body using 'delete'
            const userData = await new userCollection(req.body).save();
            req.session.accountCreated = 'Account created successfully, Login to continue!'
            return res.redirect('/user/login')
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}



const getLogin = (req, res) => {
    if (req.session.accountCreated) {
        res.render('login', { message: req.session.accountCreated, class: 'alert-success' });
        delete req.session.accountCreated;
    } else {
        res.render('login');
    }
}

const postLogin = async (req, res) => {
    try {
        if (validator.isEmail(req.body.emailOrPhone)) {
            req.session.user = await userCollection.findOne({ email: req.body.emailOrPhone });
            if (req.session.user === null) { // will return null if no matches found
                return res.render('login', { message: 'No user found, Try again!', class: 'alert-danger' })
            }
            const passwordMatch = await bcrypt.compare(req.body.password, req.session.user.password);
            if (passwordMatch) {
                req.session.loggedJustNow = true;
                res.redirect('/')
            }
        } else if (validator.isMobilePhone(req.body.emailOrPhone, 'any', { strictMode: false })) {
            req.session.user = await userCollection.findOne({ phoneNumber: Number(req.body.emailOrPhone)});
            if (req.session.user === null) { // will return null if no matches found
                return res.render('login', { message: 'No user found, Try again!', class: 'alert-danger' })
            }
            const passwordMatch = await bcrypt.compare(req.body.password, req.session.user.password);
            if (passwordMatch) {
                req.session.loggedJustNow = true;
                res.redirect('/')
            }
        }else{
            return res.render('login', { message: 'No user found, Try again!', class: 'alert-danger' })
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {
    getSignup,
    postSignup,
    getLogin,
    postLogin
}