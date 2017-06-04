var bodyParser       = require("body-parser"),
    cookieParser     = require('cookie-parser'),
    dateTime         = require('node-datetime'),
    express          = require("express"),
    expressValidator = require('express-validator'),
    flash            = require('connect-flash'),
    localStrategy    = require('passport-local'),
    method           = require("method-override"),
    mongoose         = require("mongoose"),
    passport         = require('passport'),
    path             = require('path'),
    session          = require('express-session'),  

    app              = express(),
    port             = process.env.PORT || 3000;

app.use(passport.initialize())
app.use(passport.session())

// Middleware
app.use(method("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(cookieParser());

app.use(session({
    secret              : 'timewillcomeandanswersallofyourquestions',
    saveUninitialized   : true,
    resave              : true
}));

// In this example, the formParam value is going to get morphed into form body format useful for printing.
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace   = param.split('.')
        , root          = namespace.shift()
        , formParam     = root;

        while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
        }
        return {
        param : formParam,
        msg   : msg,
        value : value
        };
    }
}));

app.use(flash());
app.use(function(request, response, next) {
    response.locals.success_msg     = request.flash('success_msg');
    response.locals.error_msg       = request.flash('error_msg');
    response.locals.error           = request.flash('error');
    next();
});

// MongoDB Connection
var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

require('./app/routes.js')(app, passport);
require('./app/users.js')(app);

app.listen(port, function(error) {
    if(error) {
        console.log(error)
    } else {
        console.log('The magic happens on port ' + port);
    }
});
