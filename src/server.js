const handlebars = require('handlebars');
const { engine } = require('express-handlebars');
const exphbs = ('express-handlebars');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');
const fileupload = require('express-fileupload');
const flash = require('connect-flash');


//Inicializations
const app = express();
require('./config/passport');

//Server Settings
app.set('port', process.env.PORT || 4000);
app.set('views',path.join(__dirname,'views'));
app.engine('hbs',engine({defaultLayout:'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',}));
app.set('view engine', '.hbs');

//Middleware
app.use(express.json());
app.use(express.urlencoded({extended:false}));
//app.use(fileupload());
app.use(morgan('dev'));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'secret',
    key: 'sid',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req,res,next) =>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    res.locals.datos = req.objects || null;
    next();
});

app.use(require('./routes/index.routes'));
app.use(require('./routes/users.routes'));
app.use(require('./routes/reports.routes'));

app.use(express.static(path.join(__dirname,'public')));
module.exports = app;