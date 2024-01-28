const express = require('express');
const app = express();
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const nocache = require('nocache');
const connectDB = require('./db');

// importing admin routes
const adminRoutes = require('./routes/adminRoutes.js');
app.use('/admin',adminRoutes);

connectDB();
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server running on port ${port}`));