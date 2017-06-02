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
    var Schema = mongoose.Schema;

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

    var userSchema = new mongoose.Schema({
        name: String,
        join_date: Date,
        active: Boolean
    });
    var userSchemas = mongoose.model('User', userSchema);

    var userCommentSchema = new mongoose.Schema({
        movie: {type: Schema.Types.ObjectId, ref: 'Movie'},
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        date: Date,
        comment: String
    });
    var userCommentSchemas = mongoose.model('Comment', userCommentSchema);

    // userCommentSchemas.create({
    //     movie: '593156f36b33413efc9b9ab0',
    //     user: '593186d83a5e6621404f7582',
    //     date: '2017-6-2 23:54:22',
    //     comment: 'This movie is awesome. I cannt even blink'
    // })
    
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

app.get("/movie/:id", function(request, response) {
    var q = movieSchemas.findOne({_id: request.params.id}).populate('movie').populate('user');
    q.exec(function(error, moviePrev) {
        if (error) {
            console.log(error);
        } else {
            response.render("movie", {active: 0, title: "Movie Preview", moment: moment, fmovie: moviePrev});
        }
    })
});

app.listen(3000, function(error) {
    console.log("server starting")
});
