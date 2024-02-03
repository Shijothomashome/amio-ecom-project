const express = require('express');
const router = express.Router();
const commonControllers = require('../controllers/commonControllers');

router.get('/signup',commonControllers.getSignup);
router.post('/signup',commonControllers.postSignup)
router.get('/login',commonControllers.getLogin);
router.post('/login',commonControllers.postLogin);
router.get('/dashboard',commonControllers.getDashboard);
router.post('/logout',commonControllers.getLogout);

router.get('/', commonControllers.getHome);
router.get('/about',commonControllers.getAbout);
router.get('/contact',commonControllers.getContacts);
router.get('/FAQs',commonControllers.getFAQs);
router.get('/cart',commonControllers.getCart);

module.exports = router;