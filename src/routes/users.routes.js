const { Router } = require('express');
const router = Router();
const passport = require('passport');
const { signup, logout, renderDashboard} = require('../controllers/user.controller');
const { isAuthenticated } = require('../helpers/auth');

const checkForData = (req,res,next) =>{
    (req.session.data)&&(delete req.session.data);
    return next();
}

//Login Routes
router.get('/login',function (req,res) {res.render('users/login');});
router.post('/login', passport.authenticate('local',{successRedirect:'/dashboard',failureRedirect: '/login'}));
//Signup Routes
router.get('/signup', function (req,res) {res.render('users/signup');});
router.post('/signup', signup);
//logout
router.get('/logout', isAuthenticated, logout);
//User Specific Dashboard
router.get('/dashboard', isAuthenticated ,checkForData, renderDashboard);

module.exports = router;