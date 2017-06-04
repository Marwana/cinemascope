var mongoose    = require("mongoose"),
    schema      = mongoose.Schema,
    db          = mongoose.connection,
    user        = require("../models/user");

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

var Movie   = module.exports = movieSchemas;
var Comment = module.exports = userCommentSchemas;

module.exports = {movieSchemas, userCommentSchemas};
