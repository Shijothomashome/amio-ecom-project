const userCollection = require('../models/userModel');










const common = (page) => {
    return (req, res) => {
        try{
            if (req.session.user && req.session.loggedJustNow) { // this 'if' will work only for postLogin setup
                req.session.loggedJustNow = false;
                res.render(page, { loginSuccess: 'Login successful!', heading: req.session.user.firstName, endPoint: '/user/dashboard', class: 'd-none' });
            } else if (req.session.user) {
                res.render(page, { heading: req.session.user.firstName, endPoint: '/user/dashboard', class: 'd-none' });
            } else {
                res.render(page);
            }
        }catch(err){
            console.log(err);
            res.status(500).render('500');
        }
    }
}

const getHome = common('index');
const getAbout = common('about');
const getContacts = common('contact');
const getFAQs = common('FAQs');
const getCart = common('cart');




module.exports = {
    getHome,
    getAbout,
    getContacts,
    getFAQs,
    getCart
}