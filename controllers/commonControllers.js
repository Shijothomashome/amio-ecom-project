const userCollection = require('../models/userModel');
const bcrypt = require('bcrypt');
const validator = require('validator');
var nodemailer = require('nodemailer');



const getSignup = (req, res) => {
    try {
        res.render('./common/signup');
    } catch (err) {
        console.error(err);
        res.status(500).render('./common/500');
    }
}

const sendEmail = (tempUser, task, OTP) => {
    console.log('check');
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'amiowatches@gmail.com',
            pass: 'nsuv jvcb locc mqtk'
        }
    });

    var mailOptions = {
        from: 'amiowatches@gmail.com',
        to: tempUser.email,
        subject: `Your One-Time Password for Amio Account ${task}`,
        text: `Dear ${tempUser.firstName},
        Your Amio account ${task} code is: ${OTP}. Please use this code to complete the ${task} process.
        Thank you,
        Team Amio`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


const postSignup = async (req, res) => {
    try {
        const existingEmail = await userCollection.findOne({ email: req.body.email });
        const existingPhoneNumber = await userCollection.findOne({ phoneNumber: req.body.phoneNumber });

        if (existingEmail) {
            res.render('./common/signup', { message: 'Email is already registered!', class: 'alert-danger', firstName: req.body.firstName, lastName: req.body.lastName, phoneNumber: req.body.phoneNumber, password: req.body.password, rePassword: req.body.rePassword, EmailBorderColor: 'border-danger' });
        } else if (existingPhoneNumber) {
            res.render('./common/signup', { message: 'Mobile number is already registered!', class: 'alert-danger', firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, password: req.body.password, rePassword: req.body.rePassword, MobileBorderColor: 'border-danger' });
        } else {
            req.session.currentUser = req.body;


            if (req.session.tempUsers && req.session.tempUsers[req.session.index].email === req.session.currentUser.email) {
                console.log('===');
                console.log(req.session.tempUsers[req.session.index]);
                console.log(req.session.currentUser);

                req.session.tempUsers.push(req.session.currentUser);
                req.session.index = req.session.tempUsers.length - 1;
                let currentTime = 30 - Math.floor((Date.now() - req.session.emailSendTime) / 1000);
                if (!req.session.emailSendTime || currentTime <= 0) {
                    req.session.OTP = Math.floor(100000 + Math.random() * 900000);
                    sendEmail(req.session.tempUsers[req.session.index], 'verification', req.session.OTP);
                    req.session.emailSendTime = Date.now();
                }
                res.redirect(`/signup-otp/${req.session.index}`);
            }
            else if (req.session.tempUsers && req.session.tempUsers[req.session.index].email !== req.session.currentUser.email) {
                console.log('!==');
                console.log(req.session.tempUsers[req.session.index]);
                console.log(req.session.currentUser);

                req.session.tempUsers.push(req.session.currentUser);
                req.session.index = req.session.tempUsers.length - 1;
                req.session.OTP = Math.floor(100000 + Math.random() * 900000);
                sendEmail(req.session.tempUsers[req.session.index], 'verification', req.session.OTP);
                req.session.emailSendTime = Date.now();
                res.redirect(`/signup-otp/${req.session.index}`);
            } else if (!req.session.tempusers) {
                console.log('no temp user')
                console.log(req.session.currentUser);
                req.session.tempUsers = [];
                req.session.tempUsers.push(req.session.currentUser);
                req.session.index = req.session.tempUsers.length - 1;
                let currentTime = 30 - Math.floor((Date.now() - req.session.emailSendTime) / 1000);
                if (!req.session.emailSendTime || currentTime <= 0) {
                    req.session.OTP = Math.floor(100000 + Math.random() * 900000);
                    sendEmail(req.session.tempUsers[req.session.index], 'verification', req.session.OTP);
                    req.session.emailSendTime = Date.now();
                }
                res.redirect(`/signup-otp/${req.session.index}`);
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('./common/500');
    }
}


const getSignupOTP = (req, res) => {
    try {
        const index = req.params.index;
        if (req.session.OTP && req.session.invalidOTP) {
            const message = req.session.invalidOTP;
            delete req.session.invalidOTP;
            res.render('./common/OTP', { emailSendTime: req.session.emailSendTime, invalidOTP: message, index })
        } else if (req.session.OTP) {
            res.render('./common/OTP', { emailSendTime: req.session.emailSendTime, index });
        } else {
            res.status(500).render('./common/500', { index });
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('./common/500');
    }
}

const postSignupOTP = async (req, res) => {
    try {
        if (req.session.OTP) {
            if (req.session.OTP === Number(req.body.otp)) {
                const index = req.params.index;
                req.body = req.session.tempUsers[index];
                delete req.session.tempUsers[index];
                delete req.session.OTP;

                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                req.body.password = hashedPassword;
                delete req.body.rePassword;   // no need use this line here because, in the schema we haven't used rePassword, but try to understand that we can delete a field from req.body using 'delete'
                const userData = await new userCollection(req.body).save();
                req.session.accountCreated = 'Account created successfully, Login to continue!'
                return res.redirect('/login');
            } else {
                req.session.invalidOTP = 'Invalid OTP. Please check your code and try again.';
                res.redirect('/signup-otp');
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('./common/500');
    }
}

const getResendOTP = (req, res) => {
    try {
        const index = parseInt(req.params.index);
        if (index >= 0 && index < req.session.tempUsers.length) {
            req.session.OTP = Math.floor(100000 + Math.random() * 900000);
            sendEmail(req.session.tempUsers[index], 'verification', req.session.OTP);
            req.session.emailSendTime = Date.now();
            res.redirect(`/signup-otp/${index}`);
        } else {
            console.error(err);
            res.status(500).render('./common/500');
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('./common/500');
    }
}


const getLogin = (req, res) => {
    try {
        if (req.session.accountCreated) {
            const text = req.session.accountCreated;
            delete req.session.accountCreated;
            res.render('./common/login', { message: text, class: 'alert-success' });
        } else {
            res.render('./common/login');
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('./common/500');
    }
}

const postLogin = async (req, res) => {
    try {
        if (validator.isEmail(req.body.emailOrPhone)) {
            req.session.user = await userCollection.findOne({ email: req.body.emailOrPhone });
            if (req.session.user === null) { // will return null if no matches found

                return res.render('./common/login', { message: 'No user found, Try again!', class: 'alert-danger' })
            }
            const passwordMatch = await bcrypt.compare(req.body.password, req.session.user.password);
            if (passwordMatch) {
                req.session.loggedJustNow = true;
                res.redirect('/')
            } else {
                return res.render('./common/login', { labelMessage: 'Wrong password. Try again! or reset the password', labelClass: 'text-danger', emailOrPhone: req.body.emailOrPhone, borderColor: 'border-danger' })
            }
        } else if (validator.isMobilePhone(req.body.emailOrPhone, 'any', { strictMode: false })) {
            req.session.user = await userCollection.findOne({ phoneNumber: Number(req.body.emailOrPhone) });
            if (req.session.user === null) { // will return null if no matches found
                return res.render('./common/login', { message: 'No user found, Try again!', class: 'alert-danger' })
            }
            const passwordMatch = await bcrypt.compare(req.body.password, req.session.user.password);
            if (passwordMatch) {
                req.session.loggedJustNow = true;
                res.redirect('/')
            } else {
                return res.render('./common/login', { labelMessage: 'Wrong password. Try again! or reset the password', labelClass: 'text-danger', emailOrPhone: req.body.emailOrPhone, borderColor: 'border-danger' })
            }
        } else {
            return res.render('./common/login', { message: 'No user found, Try again!', class: 'alert-danger' })
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('./common/500');
    }
}



const getDashboard = (req, res) => {
    try {
        if (req.session.user) return res.render('./common/dashboard', { sessionUser: req.session.user.firstName, endPoint: '/dashboard', class: 'd-none' });
        res.redirect('/login');
    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
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
            res.status(500).render('./common/500');
        }
    }
}

const getHome = common('./common/index');
const getAbout = common('./common/about');
const getContacts = common('./common/contact');
const getFAQs = common('./common/FAQs');
const getCart = common('./common/cart');

const getLogout = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.err('Error destroying session', err)
                res.status(500).render('./common/500');
            } else {
                res.redirect('/')
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}


// password reset
const getForgotPasswordEmailAsk = (req, res) => {
    try {
        if (req.session.errorMessage) {
            const text = req.session.errorMessage;
            delete req.session.errorMessage;
            res.render('./common/forgotPasswordEmailAsk', { message: text, class: 'alert-danger' })
        } else {
            res.render('./common/forgotPasswordEmailAsk')
        }
    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}

const postForgotPasswordEmailAsk = async (req, res) => {
    try {
        req.session.forgotUser = await userCollection.findOne({ email: req.body.emailOrPhone });
        if (!req.session.forgotUser) { // will return null if no matches found
            return res.render('./common/forgotPasswordEmailAsk', { message: 'No user associated with this email!', class: 'alert-danger' })
        } else {
            if (!req.session.forgotUsers) {
                console.log('first time');
                req.session.forgotUsers = [];
                req.session.forgotUserIndex = req.session.forgotUsers.length - 1;
            }
           
            let currentTime = 30 - Math.floor((Date.now() - req.session.emailSendTime) / 1000);

            if (!req.session.emailSendTime || currentTime <= 0 || req.session.forgotUsers[req.session.forgotUserIndex].email !== req.session.forgotUser.email) {
                console.log('!==');
                console.log(req.session.forgotUser);
                console.log(req.session.forgotUsers[req.session.forgotUserIndex])
                req.session.forgotUsers.push(req.session.forgotUser);
                req.session.forgotUserIndex = req.session.forgotUsers.length - 1;

                req.session.OTP = Math.floor(100000 + Math.random() * 900000);
                sendEmail(req.session.forgotUsers[req.session.forgotUserIndex], 'resetting', req.session.OTP);
                req.session.emailSendTime = Date.now();
            }
            res.redirect(`/forgot-password-otp/${req.session.forgotUserIndex}`);

        }
       


    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}



const getForgotPasswordOTPAsk = (req, res) => {
    try {
        const index = req.params.index
        if (req.session.OTP && req.session.invalidOTP) {
            const message = req.session.invalidOTP;
            delete req.session.invalidOTP;
            res.render('./common/forgotPasswordOTPAsk', { emailSendTime: req.session.emailSendTime, invalidOTP: message, index })
        } else if (req.session.OTP) {
            res.render('./common/forgotPasswordOTPAsk', { emailSendTime: req.session.emailSendTime, index });
        } else {
            res.status(500).render('./common/500');
        }
    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}

const postForgotPasswordOTPAsk = (req, res) => {
    try {
        const index = req.params.index;
        if (req.session.OTP) {
            if (req.session.OTP === Number(req.body.otp)) {
                delete req.session.OTP;

                req.session.authentification = 'Authentification successful. Reset the password!'
                return res.redirect(`/forgot-password-reset/${index}`);
            } else {
                req.session.invalidOTP = 'Invalid OTP. Please check your code and try again.';
                res.redirect(`/forgot-password-otp/${index}`);
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}


const getPasswordResetResendOTP = (req, res) => {
    try {
        const index = req.params.index;
        console.log('resend otp')
        req.session.OTP = Math.floor(100000 + Math.random() * 900000);
        sendEmail(req.session.forgotUsers[index], 'resetting', req.session.OTP);
        req.session.emailSendTime = Date.now();
        res.redirect(`/forgot-password-otp/${index}`);
    } catch (err) {
        console.error(err);
        res.status(500).render('./common/500');
    }
}

const getForgotPasswordReset = (req, res) => {
    try {
        const index = req.params.index;
        if (req.session.authentification) {
            const text = req.session.authentification;
            delete req.session.authentification;
            res.render('./common/forgotPasswordReset', { message: text, class: 'alert-success', index});
        } else {
            console.log(err);
            res.status(500).render('./common/500');
        }

    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}





const postForgotPasswordReset = async (req, res) => {
    try {
        const index = req.params.index;
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;
        // const updatedUser = await userCollection.findByIdAndUpdate(req.body._id, { password: req.body.password });
        // OR
        const updatedUser = await userCollection.updateOne({ _id: req.session.forgotUsers[index]._id }, { $set: { password: req.body.password } });
        delete req.session.forgotUsers[index];
        if (updatedUser) {
            // Password updated successfully
            req.session.accountCreated = 'Password updated successfully, Login to continue!';
            return res.redirect('/login');
        } else {
            // User not found or error occurred while updating
            req.session.errorMessage = 'Failed to update password. Please try again.';
            return res.redirect('/forgot-password-email');
        }

    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}



module.exports = {
    getSignup,
    postSignup,
    getLogin,
    postLogin,
    getDashboard,
    getLogout,
    getSignupOTP,
    postSignupOTP,
    getResendOTP,
    getForgotPasswordEmailAsk,
    getForgotPasswordOTPAsk,
    getForgotPasswordReset,
    postForgotPasswordEmailAsk,
    postForgotPasswordOTPAsk,
    postForgotPasswordReset,
    getPasswordResetResendOTP,


    getHome,
    getAbout,
    getContacts,
    getFAQs,
    getCart
}