var express     = require("express"),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    moment      = require('moment');
    method      = require("method-override"),
    app         = express();

    // Middleware
    app.use(method("_method"));
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(express.static("public"));
    app.set("view engine", "ejs");

    // MongoDB Connection
    mongoose.connect('mongodb://bekraf:pwd123456!!@ds157641.mlab.com:57641/bekraf_nodedb');
    var movieSchema = new mongoose.Schema({
        title: String,
        release_date: Date,
        image: String,
        category: String,
        rating: String,
        star: Number,
        comments: Number,
        boxoffice: Boolean,
        description: String
    });

    var movieSchemas = mongoose.model('Movie', movieSchema);
    
app.get("/", function(request, response) {
    response.render("index", {title: "CinemaScope"})
});

app.get("/newrelease", function(request, response) {
    var q = movieSchemas.find().sort({'release_date': -1}).limit(20);
    q.exec(function(error, allMovies) {
        if (error) {
            console.log(error);
        } else {
            response.render("movielist", {title: "New Release", header: "New Release", moment: moment, movies: allMovies});
        }
    })
});

app.get("/topboxoffice", function(request, response) {
    var q = movieSchemas.find({'boxoffice': true}).sort({'release_date': -1}).limit(20);
    q.exec(function(error, allMovies) {
        if (error) {
            console.log(error);
        } else {
            response.render("movielist", {title: "Top Box Office", header: "Top 20 Box Office", moment: moment, movies: allMovies});
        }
    })
});

app.get("/topfavourite", function(request, response) {
    var q = movieSchemas.find().sort({'star': -1}).limit(20);
    q.exec(function(error, allMovies) {
        if (error) {
            console.log(error);
        } else {
            response.render("movielist", {title: "Top Favourite", header: "Top 20 Favourite", moment: moment, movies: allMovies});
        }
    })
});

app.get("/movie/:id", function(request, response) {
    var q = movieSchemas.findById(request.params.id);
    q.exec(function(error, moviePrev) {
        if (error) {
            console.log(error);
        } else {
            response.render("movie", {title: "Movie Preview", moment: moment, fmovie: moviePrev});
        }
    })
});

app.listen(3000, function(error) {
    console.log("server starting")
});
