/**
 * Created by Brian on 06/10/2016.
 */
var bcrypt = require('bcryptjs');

var salt = bcrypt.genSaltSync(10);
var hash= bcrypt.hashSync("password", salt);
// bcrypt.hashSync("password", salt)

var users = [
    {username: "brian@gmail.com", password: bcrypt.hashSync("password", salt)}
    // {username: "brian2@gmail.com", password: bcrypt.hashSync("password", salt)},
    // {username: "brian3@gmail.com", password: bcrypt.hashSync("password", salt)}
];

exports.users = users;


