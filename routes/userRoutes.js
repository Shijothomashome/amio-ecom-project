const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');

router.get('/signup',userControllers.getSignup);
router.post('/signup',userControllers.postSignup)
router.get('/login',userControllers.getLogin);
router.post('/login',userControllers.postLogin)

module.exports = router;
