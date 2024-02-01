const express = require('express');
const router = express.Router();
const commonControllers = require('../controllers/commonControllers');

router.get('/', commonControllers.getHome);
router.get('/about',commonControllers.getAbout);
router.get('/contact',commonControllers.getContacts);
router.get('/FAQs',commonControllers.getFAQs);
router.get('/cart',commonControllers.getCart);

module.exports = router;