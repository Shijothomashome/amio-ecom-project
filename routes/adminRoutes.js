const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/adminControllers');
router.get('/setAdmin',adminControllers.setAdmin);

module.exports = router;