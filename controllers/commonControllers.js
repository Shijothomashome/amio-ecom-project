const userCollection = require('../models/userModel');
const bcrypt = require('bcrypt');
const validator = require('validator');


const getSignup = (req, res) => {
    try {
        res.render('signup');
    } catch (err) {
        console.error(err);
        res.status(500).render('500');
    }
}

const postSignup = async (req, res) => {
    // try {
        const existingEmail = await userCollection.findOne({ email: req.body.email });
        const existingPhoneNumber = await userCollection.findOne({ phoneNumber: req.body.phoneNumber });
        if (existingEmail) {
            res.render('signup', { message: 'Email is already registered!', class: 'alert-danger', firstName: req.body.firstName, lastName: req.body.lastName, phoneNumber: req.body.phoneNumber, password: req.body.password, rePassword: req.body.rePassword, EmailBorderColor: 'border-danger' });
        } else if (existingPhoneNumber) {
            res.render('signup', { message: 'Mobile number is already registered!', class: 'alert-danger', firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, password: req.body.password, rePassword: req.body.rePassword, MobileBorderColor: 'border-danger' });
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            req.body.password = hashedPassword;
            delete req.body.rePassword;   // no need use this line here because, in the schema we haven't used rePassword, but try to understand that we can delete a field from req.body using 'delete'
            const userData = await new userCollection(req.body).save();
            req.session.accountCreated = 'Account created successfully, Login to continue!'
            return res.redirect('/login')
        }
    // } catch (err) {
    //     console.error(err);
    //     res.status(500).render('500');
    // }
}


const getLogin = (req, res) => {
    try {
        if (req.session.accountCreated) {
            const text = req.session.accountCreated;
            delete req.session.accountCreated;
            res.render('login', { message: text, class: 'alert-success' });
        } else {
            res.render('login');
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('500');
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
            req.session.user = await userCollection.findOne({ phoneNumber: Number(req.body.emailOrPhone) });
            if (req.session.user === null) { // will return null if no matches found
                return res.render('login', { message: 'No user found, Try again!', class: 'alert-danger' })
            }
            const passwordMatch = await bcrypt.compare(req.body.password, req.session.user.password);
            if (passwordMatch) {
                req.session.loggedJustNow = true;
                res.redirect('/')
            }
        } else {
            return res.render('login', { message: 'No user found, Try again!', class: 'alert-danger' })
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('500');
    }
}



const getDashboard = (req, res) => {
    try {
        if (req.session.user) return res.render('dashboard', { sessionUser: req.session.user.firstName, endPoint: '/dashboard', class: 'd-none' });
        res.redirect('/login');
    } catch (err) {
        console.log(err);
        res.status(500).render('500');
    }
}


const common = (page) => {
    return (req, res) => {
        try {
            if (req.session.user && req.session.loggedJustNow) { // this 'if' will work only for postLogin setup
                req.session.loggedJustNow = false;
                res.render(page, { loginSuccess: 'Login successful!', sessionUser: req.session.user.firstName, endPoint: '/dashboard', class: 'd-none' });
            } else if (req.session.user) {
                res.render(page, { sessionUser: req.session.user.firstName, endPoint: '/dashboard', class: 'd-none' });
            } else {
                res.render(page);
            }
        } catch (err) {
            console.log(err);
            res.status(500).render('500');
        }
    }
}

const getHome = common('index');
const getAbout = common('about');
const getContacts = common('contact');
const getFAQs = common('FAQs');
const getCart = common('cart');

const getLogout = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.err('Error destroying session', err)
                res.status(500).render('500');
            } else {
                res.redirect('/')
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).render('500');
    }
}



module.exports = {
    getSignup,
    postSignup,
    getLogin,
    postLogin,
    getDashboard,
    getLogout,


    getHome,
    getAbout,
    getContacts,
    getFAQs,
    getCart
}