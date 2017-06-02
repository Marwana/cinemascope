var express     = require("express"),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
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
        star: Number,
        comments: Number,
        description: String
    });

    var movieSchemas = mongoose.model('Movie', movieSchema);
    
app.get("/", function(request, response) {
    response.render("index", {title: "CinemaScope"})
});

app.get("/newrelease", function(request, response) {
    movieSchemas.find({}, function(error, allMovies) {
        if (error) {
            console.log(error);
        } else {
            response.render("movielist", {title: "New Release", header: "New Release", movies: allMovies});
        }
    })
});

app.get("/topboxoffice", function(request, response) {
    response.render("movielist", {title: "Top Box Office", header: "Top 20 Box Office"})
});

app.get("/topfavourite", function(request, response) {
    response.render("movielist", {title: "Top Favourite", header: "Top 20 Favourite"})
});

app.get("/movie/:id", function(request, response) {
    response.render("movielist", {title: "Movie", header: "Top 20 Favourite"})
});

app.listen(3000, function(error) {
    console.log("server starting")
});
