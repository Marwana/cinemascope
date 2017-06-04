var bcrypt      = require('bcryptjs'),
    mongoose    = require("mongoose"),
    schema      = mongoose.Schema,
    db          = mongoose.connection;

var userSchema = mongoose.Schema({
    firstname       : {type: String, default: ''},
    lastname        : {type: String, default: ''},
    username        : {type: String, index: true, default: ''},
    email           : String,
    password        : String,
    join_date       : {type: Date, default: Date.now},
    active          : {type: Boolean, index: true, default: false}
});

var userSchemas     = mongoose.model('User', userSchema);
// var User            = module.exports = mongoose.model('User', userSchema);

module.exports = {userSchema, userSchemas};
module.exports.createUser = function(newUser, callback) {
    bcrypt.genSalt(10, function(error, salt) {
        bcrypt.hash(newUser.password, salt, function(error, hash) {
            newUser.password = hash;
            newUser.save(callback);
        })
    })
}