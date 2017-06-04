var model   = require("../models/cinema"),
    moment  = require("moment");

module.exports = function(app, passport) {
    app.get("/", function(request, response) {
        response.render("index", {active: 0, title: "CinemaScope", loggedIn: isLoggedIn})
    });

    app.get("/newrelease", function(request, response) {
        var q = model.movieSchemas.find({}).sort({"release_date": -1}).limit(20);
        q.exec(function(error, allMovies) {
            if (error) {
                console.log(error);
            } else {
                response.render("movielist", {active: 1, title: "New Release", loggedIn: isLoggedIn, header: "New Release", moment: moment, movies: allMovies});
            }
        })
    });

    app.get("/topboxoffice", function(request, response) {
        var q = model.movieSchemas.find({"boxoffice": true}).sort({"release_date": -1}).limit(20);
        q.exec(function(error, allMovies) {
            if (error) {
                console.log(error);
            } else {
                response.render("movielist", {active: 2, title: "Top Box Office", header: "Top 20 Box Office", loggedIn: isLoggedIn, moment: moment, movies: allMovies});
            }
        })
    });

    app.get("/topfavourite", function(request, response) {
        var q = model.movieSchemas.find().sort({"star": -1}).limit(20);
        q.exec(function(error, allMovies) {
            if (error) {
                console.log(error);
            } else {
                response.render("movielist", {active: 3, title: "Top Favourite", header: "Top 20 Favourite", loggedIn: isLoggedIn, moment: moment, movies: allMovies});
            }
        })
    });

    // Preview Movie
    app.get("/movie/:id", function(request, response) {
        model.movieSchemas.findById({_id: request.params.id}, function(error, moviePrev) {
            if (error) {
                console.log(error);
            } else {
                var q2 = model.userCommentSchemas.find({"movie": request.params.id}).sort({"date": -1}).populate("user");
                q2.exec(function(error, movieComms) {
                    if(error) {
                        console.log(error)
                    } else {
                        response.render("movie", {active: 0, title: "Movie Preview", moment: moment, loggedIn: isLoggedIn, fmovie: moviePrev, comments: movieComms, loggedIn: isLoggedIn});
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
        model.userCommentSchemas.create(newComment, function(error, newComm) {     //INSERT COMMENT
            if(error) {
                console.log(error)
            } else {
                model.movieSchemas.findById(movie, function(error, cMovie) {       //FIND MOVIE
                    if(error) {
                        console.log(error)
                    } else {
                        var tComments = cMovie.comments;                           // GET TOTAL COMMENTS
                        console.log("Total Komen : " + tComments)
                        
                        model.movieSchemas.findByIdAndUpdate(movie, { comments: parseInt(tComments) + 1 }, function(error, myMovie) {                                                 // UPDATE TOTAL COMMENTS
                            if(error) {
                                console.log(error)
                            } else {
                                model.movieSchemas.findById(movie, function(error, myMovie) {       //FIND MOVIE
                                    if(error) {
                                        console.log(error)
                                    } else {
                                        console.log("Total Komen Baru : " + myMovie.comments)

                                        var q2 = model.userCommentSchemas.find({"movie": request.params.id}).sort({"date": -1}).populate("user");
                                        q2.exec(function(error, movieComms) {             // GET COMMENTS LIST AND POPULATE USER NAME
                                            if(error) {
                                                console.log(error)
                                            } else {
                                                response.render("movie", {active: 0, title: "Movie Preview", loggedIn: isLoggedIn, moment: moment, fmovie: myMovie, comments: movieComms});
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
    })
}

// route middleware to make sure a user is logged in
function isLoggedIn(request, response, next) {
    // if user is authenticated in the session, carry on 
    if (request.isAuthenticated())
        return next();

    // if they aren"t redirect them to the home page
    response.redirect("/member/login");
}
