/**
 * Created by Brian on 06/10/2016.
 */
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync("password", salt);

const loggedInUsers = {};


const users = {
    "brian@gmail.com": bcrypt.hashSync("password", salt),
    "daviddonnellan13@gmail.com": bcrypt.hashSync("password", salt),
    "declan@gmail.com": bcrypt.hashSync("password", salt),
    "test@gmail.com": bcrypt.hashSync("password", salt)
};

function isUserValid(email, password) {
    return users[email] && users[email] === bcrypt.hashSync(password, salt);
}

function isUserLoggedIn(userId) {
     return !!loggedInUsers[userId];
   
}

function logUserIn(userId) {
    loggedInUsers[userId] = true;
}

module.exports = {
    isUserValid,
    isUserLoggedIn,
    logUserIn
};



