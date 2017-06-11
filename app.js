var bodyParser       = require("body-parser"),
    cookieParser     = require("cookie-parser"),
    dateTime         = require("node-datetime"),
    express          = require("express"),
    expressValidator = require("express-validator"),
    flash            = require("flash"),
    localStrategy    = require("passport-local"),
    method           = require("method-override"),
    moment           = require("moment"),
    mongoose         = require("mongoose"),
    passport         = require("passport"),
    path             = require("path"),
    session          = require("express-session"),

    app              = express(),
    port             = process.env.PORT || 3000;

app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.set("view engine", "ejs");
app.use(method("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser('keyboard cat'));
app.use(session({
    secret              : "timewillcomeandanswersallofyourquestions",
    saveUninitialized   : true,
    resave              : true
}));
// cookie              : { maxAge: 60000 }

app.use(flash());
app.use(function(request, response, next) {
    // response.locals.success_msg     = request.flash("success_msg");
    // response.locals.error_msg       = request.flash("error_msg");
    // response.locals.error           = request.flash("error");
    response.locals.user            = request.user || null;
    next();
});

// In this example, the formParam value is going to get morphed into form body format useful for printing.
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace   = param.split(".")
        , root          = namespace.shift()
        , formParam     = root;

        while(namespace.length) {
        formParam += "[" + namespace.shift() + "]";
        }
        return {
        param : formParam,
        msg   : msg,
        value : value
        };
    }
}));

// MongoDB Connection=======================================================
var configDB = require("./config/database.js");
mongoose.connect(configDB.url);

var bcrypt      = require("bcryptjs"),
    mongoose    = require("mongoose"),
    schema      = mongoose.Schema,
    db          = mongoose.connection;

var userSchema = mongoose.Schema({
    firstname       : {type: String, default: ""},
    lastname        : {type: String, default: ""},
    username        : {type: String, index: true, default: ""},
    email           : {type: String, index: true, default: ""},
    password        : String,
    join_date       : {type: Date, default: Date.now},
    active          : {type: Boolean, index: true, default: true}
});

var movieSchema = mongoose.Schema({
    title           : {type: String, default: ""},
    release_date    : {type: Date, index: true},
    image           : {type: String, default: ""},
    category        : {type: String, index: true, default: ""},
    rating          : {type: String, index: true, default: ""},
    star            : {type: Number, index: true, default: 0},
    comments        : {type: Number, index: true, default: 0},
    boxoffice       : {type: Boolean, index: true, default: false},
    description     : {type: String, default: ""}
});

var userCommentSchema = mongoose.Schema({
    movie           : {type: schema.Types.ObjectId, ref: "Movie"},
    user            : {type: schema.Types.ObjectId, ref: "User"},
    date            : {type: Date, index: true, default: Date.now},
    comment         : {type: String, default: ""}
});

var movieSchemas        = mongoose.model("Movie", movieSchema);
var userCommentSchemas  = mongoose.model("Comment", userCommentSchema);
var userSchemas         = mongoose.model("User", userSchema);


// ROUTING ======================================================================
app.get("/", function(request, response) {
    response.render("index", {active: 0, title: "CinemaScope", session: request.session})
});

app.get("/newrelease", function(request, response) {
    var q = movieSchemas.find({}).sort({"release_date": -1}).limit(20);
    q.exec(function(error, allMovies) {
        if (error) {
            console.log(error);
        } else {
            response.render("movielist", {active: 1, title: "New Release", header: "New Release", moment: moment, movies: allMovies, session: request.session});
        }
    })
});

app.get("/topboxoffice", function(request, response) {
    var q = movieSchemas.find({"boxoffice": true}).sort({"release_date": -1}).limit(20);
    q.exec(function(error, allMovies) {
        if (error) {
            console.log(error);
        } else {
            response.render("movielist", {active: 2, title: "Top Box Office", header: "Top 20 Box Office", moment: moment, movies: allMovies, session: request.session});
        }
    })
});

app.get("/topfavourite", function(request, response) {
    var q = movieSchemas.find({}).sort({"star": -1}).limit(20);
    q.exec(function(error, allMovies) {
        if (error) {
            console.log(error);
        } else {
            response.render("movielist", {active: 3, title: "Top Favourite", header: "Top 20 Favourite", moment: moment, movies: allMovies, session: request.session});
        }
    })
});

// Preview Movie
app.get("/movie/:id", function(request, response) {
    movieSchemas.findById({_id: request.params.id}, function(error, moviePrev) {
        if (error) {
            console.log(error);
        } else {
            var q2 = userCommentSchemas.find({"movie": request.params.id}).sort({"date": -1}).populate("user");
            q2.exec(function(error, movieComms) {
                if(error) {
                    console.log(error)
                } else {
                    response.render("movie", {active: 0, title: "Movie Preview", moment: moment, fmovie: moviePrev, comments: movieComms, session: request.session});
                }
            })
        }
    })
});

app.post("/movie/:id", function(request, response) {
    var movie   = request.body.movieid;
    var user    = request.body.userid;
    var comment = request.body.comment;

    var newComment = {movie: movie, user: user, comment: comment};
    userCommentSchemas.create(newComment, function(error, newComm) {     //INSERT COMMENT
        if(error) {
            console.log(error)
        } else {
            movieSchemas.findById(movie, function(error, cMovie) {       //FIND MOVIE
                if(error) {
                    console.log(error)
                } else {
                    var tComments = cMovie.comments;                           // GET TOTAL COMMENTS
                    console.log("Total Komen : " + tComments)
                    
                    movieSchemas.findByIdAndUpdate(movie, { comments: parseInt(tComments) + 1 }, function(error, myMovie) {                                                 // UPDATE TOTAL COMMENTS
                        if(error) {
                            console.log(error)
                        } else {
                            movieSchemas.findById(movie, function(error, myMovie) {       //FIND MOVIE
                                if(error) {
                                    console.log(error)
                                } else {
                                    console.log("Total Komen Baru : " + myMovie.comments)

                                    var q2 = userCommentSchemas.find({"movie": request.params.id}).sort({"date": -1}).populate("user");
                                    q2.exec(function(error, movieComms) {             // GET COMMENTS LIST AND POPULATE USER NAME
                                        if(error) {
                                            console.log(error)
                                        } else {
                                            response.render("movie", {active: 0, title: "Movie Preview", moment: moment, fmovie: myMovie, comments: movieComms, session: request.session});
                                            response.end();
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
});

// SIGNUP ==============================
app.get("/member/register", function(request, response) {
    response.render("register", {active: 4, title: "Registration", session: request.session});
});

// LOGIN ===============================
app.get("/member/login", function(request, response) {
    response.render("login", {active: 4, title: "Member Login", session: request.session}); 
});

passport.use(new localStrategy(
    function(username, password, done) {
        userSchemas.findOne({ username: username }, function (error, user) {
            if (error) { return done(error); }
            if (!user) {
                return done(null, false, { message: "Incorrect username." });
            }
            bcrypt.compare(password, user.password, function(error, isMatch) {
                if(error) {
                    console.log(error);
                } else {
                    if(isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: "Incorrect password." });
                    }
                }
            })
        });
    }
));

passport.serializeUser(function(user, done) {
    console.log("Serialize 1 : " + user.id);
    console.log("Serialize 2 : " + user.firstname);
    done(null, user.id, user.firstname);
});

passport.deserializeUser(function(id, done) {
    userSchemas.findById(id, function(error, user) {
        console.log("DeSerialize : " + user.id + " > " + user.username);
        done(error, user);
    });
});

app.post("/member/login",
    passport.authenticate("local", {successRedirect: "/newrelease", failureRedirect: "/member/login", failureFlash: true}), 
        function(request, response) {
            console.log(request.next())
            // response.redirect("/newrelease");
        }
);

app.post("/member/register", function(request, response) {
    var first_name  = request.body.firstname,
        last_name   = request.body.lastname,
        email       = request.body.email,
        user_name   = request.body.username,
        password    = request.body.password,
        password2   = request.body.password2;
    
    request.checkBody("firstname", "First Name is REQUIRED").notEmpty();
    request.checkBody("email", "Email Name is REQUIRED").notEmpty();
    request.checkBody("email", "Invalid email address").isEmail();
    request.checkBody("username", "User Name is REQUIRED").notEmpty();
    request.checkBody("password", "Password is REQUIRED").notEmpty();
    request.checkBody("password2", "Passwords dont MATCH").equals(request.body.password);

    var errors = request.validationErrors();
    if(errors) {
        request.flash("error_msg", errors);
        response.redirect("/member/register");
    } else {
        // CHECKING DATA
        console.log("Checking Data");
        checkExisting(email, user_name, function(error, breakProcess) {
            if(error) {
                console.log(error);
            } else {
                if (breakProcess=="exist") {
                    request.flash("error_msg", "User Name or Email already used !");
                    response.redirect("/member/register");
                } else {
                    console.log("SUBMITTING DATA");
                    hashPassword(password, function(error, pwd) {
                        if(error) {
                            console.log(error)
                        } else {
                            var newUser = userSchemas.create({
                                firstname   : first_name,
                                lastname    : last_name,
                                email       : email,
                                username    : user_name,
                                password    : pwd
                            });

                            request.flash("success_msg", "You have been REGISTERED...");
                            response.redirect("/member/login");
                        }
                    });
                }
            }
        });
    }
});

// LOGOUT ==============================
app.get("/member/logout", function(request, response) {
    request.flash("success_msg", "You are LOGGED OUT...");
    response.redirect("/");
    request.logOut();
    request.session.destroy();
});


var checkExisting = function(email, username, callback) {
    console.log("Email : " + email);
    console.log("Username : " + username);
    var q = userSchemas.find({"email": email}, {"username": username});
    q.exec(function(error, member) {
        if(error) {
            console.log(error);
            callback(error, "");
        } else {
            if(!member) {
                console.log("Existing username : " + member[0].username);
                callback(null, "exist");
            } else {
                console.log("safe");
                callback(null, "proceed");
            }
        }
    })
}

var hashPassword = function(password, callback) {
    bcrypt.genSalt(10, function(error, salt) {
        bcrypt.hash(password, salt, function(error, hash) {
            callback(error, hash);
        })
    })
};

// route middleware to make sure a user is logged in
// function isLoggedIn(request, response, next) {
//     // if user is authenticated in the session, carry on 
//     if (request.isAuthenticated())
//         return next();

//     // if they aren"t redirect them to the home page
//     response.redirect("/member/login");
// };


app.listen(port, function(error) {
    if(error) {
        console.log(error)
    } else {
        console.log("The magic happens on port " + port);
    }
});
