var passport        = require('passport'),
    localStrategy   = require('passport-local').Strategy,
    user            = require("../models/user");

module.exports = function(app) {
    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/member/register', function(request, response) {

        // render the page and pass in any flash data if it exists
        response.render('register', {active: 4, title: "Registration", loggedIn: isLoggedIn, message: request.flash('signupMessage')});
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/member/login', function(request, response) {

        // render the page and pass in any flash data if it exists
        response.render('login', {active: 4, title: "Member Login", loggedIn: isLoggedIn, message: request.flash('loginMessage')}); 
    });

    // passport.use(new LocalStrategy(
    //     function(username, password, done) {
    //         User.findOne({ username: username }, function (error, user) {
    //         if (error) { return done(error); }
    //         if (!user) {
    //             return done(null, false, { message: 'Incorrect username.' });
    //         }
    //         if (!user.validPassword(password)) {
    //             return done(null, false, { message: 'Incorrect password.' });
    //         }
    //         return done(null, user);
    //         });
    //     }
    //     ));

    app.post('/member/login', function(request, response) {
        passport.authenticate('local', {successRedirect: '/', failureRedirect: '/member/login', failureFlash: true}), 
            function(request, response) {
                response.redirect('/');
            }
        // response.redirect('/');
    })

    app.post('/member/register', function(request, response) {
        var first_name  = request.body.firstname;
        var last_name   = request.body.lastname;
        var email       = request.body.email;
        var user_name   = request.body.username;
        var password    = request.body.password;
        var password2   = request.body.password2;

        request.checkBody('firstname', 'First Name is REQUIRED').notEmpty();
        request.checkBody('email', 'Email Name is REQUIRED').notEmpty();
        request.checkBody('email', 'Invalid email address').isEmail();
        request.checkBody('username', 'User Name is REQUIRED').notEmpty();
        request.checkBody('password', 'Password is REQUIRED').notEmpty();
        request.checkBody('password2', 'Passwords dont MATCH').equals(request.body.password);

        var errors = request.validationErrors();
        if(errors) {
            console.log(errors);
            errors.forEach(function(error) {
                request.flash('error_msg', error.msg)
            });
            console.log(request.flash('error_msg'));
            response.render('register', {active: 4, title: "Registration", loggedIn: isLoggedIn, errors: errors});
        } else {
            console.log("proceed");
            var newUser = user.userSchemas({
                firstname   : first_name,
                lastname    : last_name,
                email       : email,
                username    : user_name,
                password    : password
            });
            user.createUser(newUser, function(error, user) {
                if(error) {
                    console.log(error)
                } else {
                    console.log(user);
                    response.redirect("/member/login");
                }
            })
        }
    })

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/member/logout', function(request, response) {
        request.logout();
        response.redirect('/');
    });
}

// route middleware to make sure a user is logged in
function isLoggedIn(request, response, next) {
    // if user is authenticated in the session, carry on 
    if (request.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    response.redirect('/member/login');
}