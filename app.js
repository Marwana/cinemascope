var dateTime        = require('node-datetime');
    express         = require("express"),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    moment          = require('moment');
    method          = require("method-override"),
    app             = express();
    passport        = require('passport');

    port            = process.env.PORT || 3000;


    // Middleware
    app.use(method("_method"));
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(express.static("public"));
    app.set("view engine", "ejs");

    // MongoDB Connection
    var configDB = require('./config/database.js');
    var Schema = mongoose.Schema;

    mongoose.connect(configDB.url);
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

    require('./app/routes.js')(app, passport);


app.listen(port, function(error) {
    if(error) {
        console.log(error)
    } else {
        console.log('The magic happens on port ' + port);
    }
});
