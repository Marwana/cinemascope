var Schema = mongoose.Schema;
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
var userSchema = new mongoose.Schema({
    name:           {type: String, default: ''},
    join_date:      {type: Date, default: Date.now},
    active:         {type: Boolean, default: false}
});
var userCommentSchema = new mongoose.Schema({
    movie:   {type: Schema.Types.ObjectId, ref: 'Movie'},
    user:    {type: Schema.Types.ObjectId, ref: 'User'},
    date:    {type: Date, default: Date.now},
    comment: {type: String, default: ''}
});

var movieSchemas = mongoose.model('Movie', movieSchema);
var userSchemas = mongoose.model('User', userSchema);
var userCommentSchemas = mongoose.model('Comment', userCommentSchema);

module.exports = {movieSchemas, userSchemas, userCommentSchemas};
