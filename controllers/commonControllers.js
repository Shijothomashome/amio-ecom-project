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
            // Below logic is very perfect which will allow unique sessions for evey user(because no one is logged in -- for that we used array session variables )
            req.session.currentUser = req.body;
            if (!req.session.tempUsers) {
                req.session.tempUsers = [];
                req.session.OTPs = [];
                req.session.emailSendTimes = []
                req.session.emails = [];
            }

            let currentTime = 30 - Math.floor((Date.now() - req.session.emailSendTimes[req.session.index]) / 1000);

            if (req.session.tempUsers.length === 0 || currentTime <= 0 || !(req.session.emails.includes(req.session.currentUser.email))) {
                console.log(req.session.tempUsers[req.session.index]);
                console.log(req.session.currentUser);

                req.session.tempUsers.push(req.session.currentUser);
                req.session.index = req.session.tempUsers.length - 1;
                req.session.OTPs.push(Math.floor(100000 + Math.random() * 900000)); // OR  req.session.OTPs[index] = (Math.floor(100000 + Math.random() * 900000));
                sendEmail(req.session.tempUsers[req.session.index], 'verification', req.session.OTPs[req.session.index]);
                req.session.emailSendTimes.push(Date.now());
                req.session.emails[req.session.index] = req.session.currentUser.email;
            }
            res.redirect(`/signup-otp/${req.session.index}`);
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('./common/500');
    }
}


const getSignupOTP = (req, res) => {
    try {
        const index = req.params.index;
        if (req.session.OTPs[index] && req.session.invalidOTP) {
            const message = req.session.invalidOTP;
            delete req.session.invalidOTP;
            res.render('./common/OTP', { emailSendTime: req.session.emailSendTimes[index], invalidOTP: message, index })
        } else if (req.session.OTPs[index]) {
            res.render('./common/OTP', { emailSendTime: req.session.emailSendTimes[index], index });
        } else {
            res.redirect('/signup');
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('./common/500');
    }
}

const postSignupOTP = async (req, res) => {
    try {
        const index = req.params.index;
        if (req.session.OTPs[index]) {
            if (req.session.OTPs[index] === Number(req.body.otp)) {
                req.body = req.session.tempUsers[index];
                delete req.session.tempUsers[index];
                delete req.session.OTPs[index];
                delete req.session.emailSendTimes[index];

                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                req.body.password = hashedPassword;
                delete req.body.rePassword;   // no need use this line here because, in the schema we haven't used rePassword, but try to understand that we can delete a field from req.body using 'delete'
                const userData = await new userCollection(req.body).save();
                req.session.accountCreated = 'Account created successfully, Login to continue!'
                return res.redirect('/login');
            } else {
                req.session.invalidOTP = 'Invalid OTP. Please check your code and try again.';
                res.redirect(`/signup-otp/${index}`);
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
        if (req.session.tempUsers[index]) {
            req.session.OTPs[index] = Math.floor(100000 + Math.random() * 900000);
            sendEmail(req.session.tempUsers[index], 'verification', req.session.OTPs[index]);
            req.session.emailSendTimes[index] = Date.now();
            res.redirect(`/signup-otp/${index}`);
        } else {
            res.redirect('/signup');
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

// "07-02-2024 10:53 PM OTP PERFECTION CHECKED TWO TABS OPEN TWO USERS AT THE SAME TIME FOR SIGNUP AND RESET PASSWORD OTP. successfully done signup otp and reset password otp. but signup otp passing is more perfect using if and 2 else if. But reset password otp is working perfectly fine. there is no error in it but when i check using two tabs open(two emails at the same time) it sends otp again before completing 30 seconds of time. When i get free time Will try to update reset otp section as same as signup otp 3loops(if,else if, else if) "
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
        // Below logic is very perfect
        req.session.forgotUser = await userCollection.findOne({ email: req.body.emailOrPhone });
        if (!req.session.forgotUser) { // will return null if no matches found
            return res.render('./common/forgotPasswordEmailAsk', { message: 'No user associated with this email!', class: 'alert-danger' })
        } else {
            if (!req.session.forgotUsers) {
                console.log('first time');
                req.session.forgotUsers = [];
                req.session.forgotOTPs = [];
                req.session.forgotEmailSendTimes = [];
                req.session.forgotEmails = [];
            }

            let currentTime = 30 - Math.floor((Date.now() - req.session.forgotEmailSendTimes[req.session.forgotUserIndex]) / 1000);

            if (req.session.forgotUsers.length === 0 || currentTime <= 0 || !req.session.forgotEmails.includes(req.session.forgotUser.email)){
                console.log('!== or after 30 seconds');
                console.log(req.session.forgotUsers[req.session.forgotUserIndex]);
                console.log(req.session.forgotUser);

                req.session.forgotUsers.push(req.session.forgotUser);
                req.session.forgotUserIndex = req.session.forgotUsers.length - 1;

                req.session.forgotOTPs.push(Math.floor(100000 + Math.random() * 900000));
                sendEmail(req.session.forgotUsers[req.session.forgotUserIndex], 'resetting', req.session.forgotOTPs[req.session.forgotUserIndex]);
                req.session.forgotEmailSendTimes.push(Date.now());
                req.session.forgotEmails[req.session.forgotUserIndex] = req.session.forgetUser.email;
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
        if (req.session.forgotOTPs[index] && req.session.invalidOTP) {
            const message = req.session.invalidOTP;
            delete req.session.invalidOTP;
            res.render('./common/forgotPasswordOTPAsk', { emailSendTime: req.session.forgotEmailSendTimes[index], invalidOTP: message, index })
        } else if (req.session.forgotOTPs[index]) {
            res.render('./common/forgotPasswordOTPAsk', { emailSendTime: req.session.forgotEmailSendTimes[index], index });
        } else {
            res.redirect('/signup');
        }
    } catch (err) {
        console.log(err);
        res.status(500).render('./common/500');
    }
}

const postForgotPasswordOTPAsk = (req, res) => {
    try {
        const index = req.params.index;
        if (req.session.forgotOTPs[index]) {
            if (req.session.forgotOTPs[index] === Number(req.body.otp)) {
                delete req.session.forgotOTPs[index];

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
        if (req.session.forgotUsers[index]) {
            console.log('resend otp')
            req.session.forgotOTPs[index] = Math.floor(100000 + Math.random() * 900000);
            sendEmail(req.session.forgotUsers[index], 'resetting', req.session.forgotOTPs[index]);
            req.session.forgotEmailSendTimes[index] = Date.now();
            res.redirect(`/forgot-password-otp/${index}`);
        }else{
            res.redirect('/login');
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('./common/500');
    }
}

const getForgotPasswordReset = (req, res) => {
    try {
        const index = req.params.index;
        if (req.session.forgotUsers[index] && req.session.authentification) {
            const text = req.session.authentification;
            delete req.session.authentification;
            res.render('./common/forgotPasswordReset', { message: text, class: 'alert-success', index });
        } else {
            res.render('/login');
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