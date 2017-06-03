module.exports = function(app, passport) {
    
    app.get("/", function(request, response) {
        response.render("index", {active: 0, title: "CinemaScope"})
    });

    app.get("/newrelease", function(request, response) {
        var q = movieSchemas.find().sort({'release_date': -1}).limit(20);
        q.exec(function(error, allMovies) {
            if (error) {
                console.log(error);
            } else {
                response.render("movielist", {active: 1, title: "New Release", header: "New Release", moment: moment, movies: allMovies});
            }
        })
    });

    app.get("/topboxoffice", function(request, response) {
        var q = movieSchemas.find({'boxoffice': true}).sort({'release_date': -1}).limit(20);
        q.exec(function(error, allMovies) {
            if (error) {
                console.log(error);
            } else {
                response.render("movielist", {active: 2, title: "Top Box Office", header: "Top 20 Box Office", moment: moment, movies: allMovies});
            }
        })
    });

    app.get("/topfavourite", function(request, response) {
        var q = movieSchemas.find().sort({'star': -1}).limit(20);
        q.exec(function(error, allMovies) {
            if (error) {
                console.log(error);
            } else {
                response.render("movielist", {active: 3, title: "Top Favourite", header: "Top 20 Favourite", moment: moment, movies: allMovies});
            }
        })
    });

    // Preview Movie
    app.get("/movie/:id", function(request, response) {
        movieSchemas.findById({_id: request.params.id}, function(error, moviePrev) {
            if (error) {
                console.log(error);
            } else {
                var q2 = userCommentSchemas.find({'movie': request.params.id}).sort({'date': -1}).populate('user');
                q2.exec(function(error, movieComms) {
                    if(error) {
                        console.log(error)
                    } else {
                        response.render("movie", {active: 0, title: "Movie Preview", moment: moment, fmovie: moviePrev, comments: movieComms});
                    }
                })
            }
        })
    });

    app.post("/movie/:id", isLoggedIn, function(request, response) {
        var movie   = request.body.movieid;
        var user    = request.body.userid;
        var comment = request.body.comment;

        var newComment = {movie: movie, user: user, comment: comment};
        userCommentSchemas.create(newComment, function(error, newComm) {    //INSERT COMMENT
            if(error) {
                console.log(error)
            } else {
                movieSchemas.findById(movie, function(error, cMovie) {      //FIND MOVIE
                    if(error) {
                        console.log(error)
                    } else {
                        var tComments = cMovie.comments;
                        console.log('Total Komen : ' + tComments)
                        
                        movieSchemas.findByIdAndUpdate(movie, { comments: parseInt(tComments) + 1 }, function(error, myMovie) {
                            if(error) {
                                console.log(error)
                            } else {
                                console.log('Total Komen Baru : ' + myMovie.comments)

                                var q2 = userCommentSchemas.find({'movie': request.params.id}).sort({'date': -1}).populate('user');
                                q2.exec(function(error, movieComms) {
                                    if(error) {
                                        console.log(error)
                                    } else {
                                        response.render("movie", {active: 0, title: "Movie Preview", moment: moment, fmovie: myMovie, comments: movieComms});
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    })

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(request, response) {

        // render the page and pass in any flash data if it exists
        response.render('signup.ejs', { message: request.flash('signupMessage') });
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(request, response) {

        // render the page and pass in any flash data if it exists
        response.render('login.ejs', { message: request.flash('loginMessage') }); 
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(request, response) {
        request.logout();
        response.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}