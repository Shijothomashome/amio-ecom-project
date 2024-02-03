const express = require('express');
const app = express();
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const nocache = require('nocache');
const connectDB = require('./db');
const commonRoutes = require('./routes/commonRoutes.js')
const adminRoutes = require('./routes/adminRoutes.js');

app.set('view engine', 'ejs');
app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true
}));

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(nocache());
app.use('/',commonRoutes);
app.use('/admin', adminRoutes);

// Global error handler middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500');
});


// 404 not found
app.use((req, res) => {
    res.status(404).render('404')
});

connectDB();
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server running on port ${port}`));