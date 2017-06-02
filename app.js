var dateTime    = require('node-datetime');
    express     = require("express"),
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
        title:          {type: String, default: ''},
        release_date:   Date,
        image:          {type: String, default: ''},
        category:       {type: String, default: ''},
        rating:         {type: String, default: ''},
        star:           {type: Number, default: 0},
        comments:       {type: Number, default: 0},
        boxoffice:      {type: Boolean, default: false},
        description:    {type: String, default: ''}
    });
    var movieSchemas = mongoose.model('Movie', movieSchema);

    var userSchema = new mongoose.Schema({
        name:           {type: String, default: ''},
        join_date:      {type: Date, default: Date.now},
        active:         {type: Boolean, default: false}
    });
    var userSchemas = mongoose.model('User', userSchema);

    var userCommentSchema = new mongoose.Schema({
        movie:   {type: Schema.Types.ObjectId, ref: 'Movie'},
        user:    {type: Schema.Types.ObjectId, ref: 'User'},
        date:    {type: Date, default: Date.now},
        comment: {type: String, default: ''}
    });
    var userCommentSchemas = mongoose.model('Comment', userCommentSchema);


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
    var q = movieSchemas.findOne({_id: request.params.id});
    q.exec(function(error, moviePrev) {
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

app.post("/movie/:id", function(request, response) {
    var movie   = request.body.movieid;
    var user    = request.body.userid;
    var comment = request.body.comment;

    var newComment = {movie: movie, user: user, comment: comment};
    userCommentSchemas.create(newComment, function(error, newComm) {
        if(error) {
            console.log(error)
        } else {
            movieSchemas.findById(movie, function(error, cMovie) {
                if(error) {
                    console.log(error)
                } else {
                    var tComm = movieSchemas.findById(movie, function(error, myMovie) {
                        if(error) {
                            console.log(error)
                        } else {
                            var tComments = myMovie.comments;
                            console.log('Total Komen : ' + tComments)

                            movieSchemas.findByIdAndUpdate(movie, { comments: parseInt(tComments) + 1 }, function(error, myMovie) {
                                if(error){
                                    console.log(error)
                                } else {
                                    console.log('Total Komen Baru : ' + myMovie.comments)
                                }
                            })
                        }
                    })
                }
            })
            response.redirect("/movie/" + movie);
        }
    })
});

app.listen(3000, function(error) {
    console.log("server starting")
});
