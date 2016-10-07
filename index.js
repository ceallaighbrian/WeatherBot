var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var apiai = require('apiai');

var logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    bcrypt = require('bcryptjs'),
    session = require('express-session');

var app = express();


var user = require('./user.js');
var users = user.users;

var loggedIn = [];

users.forEach( function (user){
    var temp = {};
    var key = user.username;
    temp[key] = false;
    loggedIn.push(temp);
});




//===============EXPRESS================
// Configure Express
app.use(logger('combined'));
app.use(cookieParser());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));


app.set('view engine', 'ejs');

// Session-persisted message middleware
app.use(function (req, res, next) {
    var err = req.session.error,
        msg = req.session.notice,
        success = req.session.success;

    delete req.session.error;
    delete req.session.success;
    delete req.session.notice;

    if (err) res.locals.error = err;
    if (msg) res.locals.notice = msg;
    if (success) res.locals.success = success;

    next();
});


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));
console.log("listening on port 3000!")

app.use(function(req, res, next) {
    res.locals.query = req.query;
    res.locals.url   = req.originalUrl;

    next();
});

// Server frontpage
app.get('/login/:userId', function (req, res) {
    console.log(req.params);
    res.locals.query = req.params;
    res.render('login');
    //take in senderid as path param
});

app.get('/privacypolicy', function(req,res){
    res.render('privacypolicy');
});

app.post('/login', function (req, res) {
   console.log(req.body);

    for (i = 0; i < users.length; i++){
        
    }

    for (i = 0; i < users.length; i++) {
        console.log(req.body.id);
        var f = false;
        if (req.body.email == users[i].username ){
            if (bcrypt.compareSync(req.body.password, users[i].password)){
                res.render('success');
                var found = false;
                for (var i =0; i<loggedIn.length; i++) {
                    if (req.body.id in loggedIn[i]) {
                        var key = req.body.id;
                        temp[key] = true;
                        found = true;
                    }
                }
                if (!found){
                    var temp = {};
                    var key = req.body.id;
                    temp[key] = true;
                    loggedIn.push(temp);
                }
                f = true;
                break;
            }
            else {
                res.render('login', {userId:req.body.userId});
                
                break;

            }
        }
        if(!f) {
            res.render('login', {userId:req.body.userId});
        }
    };
});
    


// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

app.post('/webhook', function (req, res) {
    
    console.log(loggedIn);
    console.log(req.body);
    console.log(req.headers);
    
    var events = req.body.entry[0].messaging;
    console.log(events.length);
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        console.log(event);
        
        if ((event.message)) {
            // console.log("before loop");
            // var found = false;
            // for (var i =0; i<loggedIn.length; i++) {
            //     console.log(loggedIn[i]);
            //     if (event.sender.id in loggedIn[i]) {
            //         console.log(loggedIn[i][event.sender.id]);
            //         console.log("id is in logged in");
            //         if (loggedIn[i][event.sender.id]) {
            //             console.log("Asking question");
            //             determineQuestion(event);
            //             found = true;
            //             break;
            //         }
            //         else {
            //             sendMessage(event.sender.id, {text: "Please log in false false"});
            //             found = true;
            //             break;
            //         }
            //     }
            // };
            //
            // console.log("out of loop");
            // if (!found) {
            //     sendMessage(event.sender.id, {text: "Please log in - http://localhost:3000/login/" + event.sender.id});
            // }

            // sendMessage(event.sender.id, {text: "Please log in - http://localhost:3000/login/" + event.sender.id});
            
            // console.log("not even here");
            // console.log(event.message.attachments[0].hasOwnProperty(payload));
            // console.log(event.hasOwnProperty(event.message));
            // console.log(event.message.hasOwnProperty(event.message.attachments));
            // console.log(event.message.attachments[0].payload.coordinates.lat);
            // console.log(event.message.attachments[0].payload.coordinates.long);
            determineQuestion(event);
           
        }
    }
    res.sendStatus(200);
});

//link to login page, link needs to include messageid
//map to see which users are logged in



function determineQuestion(event) {
    // TODO - Integrate with api.ai

    var apiapp = apiai("348cc61ef2684526b3e04976ee36641b");
    var path = "";
    var time;
    var weatherKey = '599d922817e8487ed56349e3c0557d01';

    // //check if location is shared
    // if (event.hasOwnProperty(event.message.attachments)){
    //     var lat = event.message.attachments[0].payload.coordinates.lat;
    //     var lon = event.message.attachments[0].payload.coordinates.long;
    //     console.log("lat=" + lat + " lon= " + lon);
    //     path = "lat=" + lat +"&lon=" + lon;
    //    
    //     console.log(path);
    //     current = true;
    //     options = {
    //         url: 'http://api.openweathermap.org/data/2.5/weather?appid=' + weatherKey + "&units=imperial&" + path.toString(),
    //         method: 'GET'
    //     };
    //     getWeather(event, options, current);
    //    
    // } else {

        var request = apiapp.textRequest(event.message.text);

        request.on('response', function (response) {

            //default response if it doesn't
            if (response.result.metadata.intentName == "Default Fallback Intent") {
                console.log("default response");
                sendMessage(event.sender.id, {text: response.result.fulfillment.speech});
            }
                else if(response.result.action == "smalltalk.greetings"){
                console.log("Smalltalk");
                sendMessage(event.sender.id, {text: response.result.fulfillment.speech});
            }
            else {
                var options;
                var parameters = response.result.parameters;
                console.log(parameters);

                //default location if none provoided 
                if (parameters["zip-code"] == "" && parameters["geo-city"] == "") {
                    path += "zip=94109";
                    console.log(path + "checking for location");
                }
                else {
                    if (parameters["zip-code"]) {
                        path += "zip=" + parameters["zip-code"];
                    }
                    else if (parameters["geo-city"]) {
                        path += "q=" + parameters["geo-city"];
                    }
                }
                console.log(path);

                //Check if current weather or forecast is required
                if (parameters["date-period"] == "" || parameters["date-period"] == null || parameters["date-period"] == "now") {
                    time = "current";
                    options = {
                        url: 'http://api.openweathermap.org/data/2.5/weather?appid=' + weatherKey + "&units=imperial&" + path.toString(),
                        method: 'GET'
                    };
                }
                    else if ((parameters["date-period"] == "tonight")){
                    time = "tonight";
                    options = {
                        url: 'http://api.openweathermap.org/data/2.5/forecast?cnt=1&appid=' + weatherKey + "&units=imperial&" + path.toString(),
                        method: 'GET'
                    };

                }
                else {
                    time = "tomorrow";
                    options = {
                        url: 'http://api.openweathermap.org/data/2.5/forecast/daily?cnt=1&appid=' + weatherKey + "&units=imperial&" + path.toString(),
                        method: 'GET'
                    };
                }

                getWeather(event, options, time);
            }

        });

        request.on('error', function (error) {
            console.log(error);
        });
    

    request.end();
    
}


function getWeather(event, path, time) {

    request(path, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var fbookResponse, temp, city, weather;
            // parse the json result
            var result = JSON.parse(body);
            console.log(result);

            switch(time){
                case "current":
                    temp = result.main.temp;
                    city = result.name;
                    weather = result.weather[0].description;
                    fbookResponse = "The current weather for " + city + " is " + weather +", The temperature is "+ temp;
                    break;

                case "tomorrow":
                    temp = result.list[0].temp.day;
                    console.log(result.list[0].temp.day);
                    city = result.city.name;
                    weather = result.list[0].weather[0].description;
                    console.log(result.list[0].weather[0].description);
                    fbookResponse = "Tomorrows weather for " + city + " is " + weather +", The temperature will be "+ temp;
                    break;

                case "tonight":
                    console.log("in tonight");
                    temp = result.list[0].main.temp;
                    console.log(result.list[0].main.temp);
                    weather = result.list[0].weather[0].description;
                    city = result.city.name;
                    fbookResponse = "Tonights weather for " + city + " is " + weather +", The temperature will be "+ temp;
                    break;
            }
            
            sendMessage(event.sender.id, {text: fbookResponse});
        }
        else {
            sendMessage(event.sender.id, {text: "Sorry there was an issue can you ask another question"});
            console.log(error, response.statusCode, body);
        }

    });

}

function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};