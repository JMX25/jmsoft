const helpers = {};

helpers.isAuthenticated = (req,res,next) =>{
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('error_msg','Please Log In.')
        res.redirect('/login');
    }
}

module.exports = helpers;