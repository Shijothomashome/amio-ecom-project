const express = require('express');
const router = express.Router();
const commonControllers = require('../controllers/commonControllers');

router.get('/signup',commonControllers.getSignup);
router.post('/signup',commonControllers.postSignup);
router.get('/login',commonControllers.getLogin);
router.post('/login',commonControllers.postLogin);
router.get('/dashboard',commonControllers.getDashboard);
router.get('/logout',commonControllers.getLogout);
router.get('/signup-otp/:index',commonControllers.getSignupOTP);
router.post('/signup-otp/:index',commonControllers.postSignupOTP);
router.get('/resend-otp/:index',commonControllers.getResendOTP);
router.get('/forgot-password-email',commonControllers.getForgotPasswordEmailAsk);
router.post('/forgot-password-email',commonControllers.postForgotPasswordEmailAsk);
router.get('/forgot-password-otp/:index',commonControllers.getForgotPasswordOTPAsk);
router.post('/forgot-password-otp/:index',commonControllers.postForgotPasswordOTPAsk);
router.get('/password-reset-resend-otp/:index',commonControllers.getPasswordResetResendOTP)
router.get('/forgot-password-reset/:index',commonControllers.getForgotPasswordReset);
router.post('/forgot-password-reset/:index',commonControllers.postForgotPasswordReset);

router.get('/', commonControllers.getHome);
router.get('/about',commonControllers.getAbout);
router.get('/contact',commonControllers.getContacts);
router.get('/FAQs',commonControllers.getFAQs);
router.get('/cart',commonControllers.getCart);



module.exports = router;