var passport        = require("passport"),
    localStrategy   = require("passport-local").Strategy;
var user            = require("../models/user");

module.exports = function(app) {
    // SIGNUP ==============================
    app.get("/member/register", function(request, response) {
        response.render("register", {active: 4, title: "Registration", loggedIn: isLoggedIn});
    });

    // LOGIN ===============================
    app.get("/member/login", function(request, response) {
        response.render("login", {active: 4, title: "Member Login", loggedIn: isLoggedIn}); 
    });

    // passport.use(new LocalStrategy(
    //     function(username, password, done) {
    //         User.findOne({ username: username }, function (error, user) {
    //         if (error) { return done(error); }
    //         if (!user) {
    //             return done(null, false, { message: "Incorrect username." });
    //         }
    //         if (!user.validPassword(password)) {
    //             return done(null, false, { message: "Incorrect password." });
    //         }
    //         return done(null, user);
    //         });
    //     }
    //     ));

    app.post("/member/login", function(request, response) {
        passport.authenticate("local", {successRedirect: "/", failureRedirect: "/member/login", failureFlash: true}), 
            function(request, response) {
                response.redirect("/newrelease");
            }
    })

    app.post("/member/register", function(request, response) {
        var first_name  = request.body.firstname;
        var last_name   = request.body.lastname;
        var email       = request.body.email;
        var user_name   = request.body.username;
        var password    = request.body.password;
        var password2   = request.body.password2;

        request.checkBody("firstname", "First Name is REQUIRED").notEmpty();
        request.checkBody("email", "Email Name is REQUIRED").notEmpty();
        // request.checkBody("email", "Invalid email address").isEmail();
        request.checkBody("username", "User Name is REQUIRED").notEmpty();
        request.checkBody("password", "Password is REQUIRED").notEmpty();
        request.checkBody("password2", "Passwords dont MATCH").equals(request.body.password);

        var errors = request.validationErrors();
        if(errors) {
            console.log(errors);
            errors.forEach(function(error) {
                request.flash("error_msg", error.msg)
            });
            response.render("register", {active: 4, title: "Registration", loggedIn: isLoggedIn, messages: request.flash("error_msg", error.msg)});
        } else {
            console.log("proceed");
            var newUser = user.userSchemas({
                firstname   : first_name,
                lastname    : last_name,
                email       : email,
                username    : user_name,
                password    : password
            });

            // Check whether email or username already exist
            var member_exist = user.userSchemas.find({"username": newUser.username}, function(error, member) {
                if(error) {
                    console.log(error);
                } else {
                    request.flash("info", "User Name already used !");
                    response.redirect("/member/register");
                }
            })

            var member_exist = user.userSchemas.find({"email": newUser.email}, function(error, member) {
                if(error) {
                    console.log(error);
                } else {
                    request.flash("info", "Email already used !");
                    response.redirect("/member/register");
                }
            })

            console.log("submitting registration, please wait...");
            // user.createUser(newUser, function(error, user) {
            //     if(error) {
            //         console.log(error);
            //     } else {
            //         console.log(user);
            //         response.redirect("/member/login");
            //     }
            // })
        }
    })

    // LOGOUT ==============================
    app.get("/member/logout", function(request, response) {
        request.logout();
        response.redirect("/");
    });
}

// route middleware to make sure a user is logged in
function isLoggedIn(request, response, next) {
    // if user is authenticated in the session, carry on 
    if (request.isAuthenticated())
        return next();

    // if they aren"t redirect them to the home page
    response.redirect("/member/login");
}