const userController = {};
const User = require('../models/User');
const passport = require('passport');

userController.renderDashboard = (req,res) =>{
    const { username } = req.user || 'test';
    res.render('dashboard',{username});
}

userController.signup = async (req,res) =>{
    const {name,email,password,confirm_password} = req.body;
    const errors = [];

    if (password != confirm_password){
        errors.push({text: "Passwords do not match."});
    }

    if (password.length < 4){
        errors.push({text:'Passwords must be at least 4 characters long.'});
    }

    if (errors.length > 0){
       res.render('users/signup',{errors,name,email});
    }else{
       const emailExists = await User.findOne({email});
       if (emailExists){
           req.flash('error_msg', 'That email is already taken.');
           res.redirect('/signup');
       }else{
           const newUser = new User({name,email,password});
           newUser.password = await newUser.encryptPassword(password);
           await newUser.save();
           req.flash('success_msg','Registered Succesfully, Please Log In.')
           res.redirect('/login');
        }
    }
};

userController.logout = (req,res) =>{
    req.logout();
    req.flash('success_msg','Logged Out');
    res.redirect('/')
};

userController.deleteUser = async (req,res)=>{
    await User.findByIdAndDelete(req.params.id);
    req.flash('success_msg','User Deleted');
    res.redirect('/');
}
module.exports = userController