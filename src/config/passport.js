const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const { authenticate, use } = require('passport');
const User = require('../models/User');
passport.use(new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    //Match email first
    const user = await User.findOne({email});


    if (!user){
        return done(null,false,{message:'User Not Found'});
    }else{

        const match = await user.matchPassword(password);

        if(match){
            return done(null,user);
        }else{
            return done(null,false,{message:'Password is Incorrect'});
        }
    }
}));


passport.serializeUser((user,done) =>{
    done(null,user);
});

passport.deserializeUser((id,done) =>{
    User.findById(id,(err, user)=>{
        done(err,user);
    })
});