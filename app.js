const express = require('express');
const app = express();
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const nocache = require('nocache');
const connectDB = require('./db');
const adminRoutes = require('./routes/adminRoutes.js');
const userRoutes = require('./routes/userRoutes.js');

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
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

app.get('/', (req, res) => {
    if(req.session.user && req.session.loggedJustNow){
        req.session.loggedJustNow = false;
        res.render('index',{loginSuccess: 'Login successful!'});
    }
    else if(req.session.user){
        res.render('index', { heading: req.session.user.firstName, endPoint: '/user/profile', class: 'd-none' })
    }else{
        res.render('index',{class:'d-block'});
    }
});

connectDB();
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server running on port ${port}`));