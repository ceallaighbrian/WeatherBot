var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var apiai = require('apiai');
var loginUtils = require('./login-utils');
var messageUtil = require('./message-utils');

var app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

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
});

app.get('/privacypolicy', function(req,res){
    res.render('privacypolicy');
});

app.post('/login', function (req, res) {
   console.log(req.body);

   if ( loginUtils.isUserValid(req.body.email, req.body.password)){
       res.render('success');
       loginUtils.logUserIn(req.body.id);
       console.log("added -- " + req.body.id);
   }
    else {
       res.render('login', {userId:req.body.userId});
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
    
    console.log(req.body);
    console.log(req.headers);
    
    var events = req.body.entry[0].messaging;
    console.log(events.length);
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        console.log(event);
        console.log(JSON.stringify(event, null, 4));
        
        if ((event.message)) {
            
            if (loginUtils.isUserLoggedIn(event.sender.id)){
                console.log("Asking question");
                determineQuestion(event);
            }
            else {
                sendMessage(event.sender.id, {text: "Please log in before you can use the service - http://localhost:3000/login/" + event.sender.id});
            }
        }
    }
    res.sendStatus(200);
});



function determineQuestion(event) {
    var apiapp = apiai("348cc61ef2684526b3e04976ee36641b");
    var path = "";
    var time;
    var weatherKey = '599d922817e8487ed56349e3c0557d01';

    var message = messageUtil.getMessages(event);
    
    //check for location 
    if (message[0].type == 'location'){
        path = "lat=" + message[0].coordinates.lat +"&lon=" + message[0].coordinates.long;
        time = "current";
        options = {
                    url: 'http://api.openweathermap.org/data/2.5/weather?appid=' + weatherKey + "&units=imperial&" + path.toString(),
                    method: 'GET'
                };
        getWeather(event,options,time);
    }
    else {
        var request = apiapp.textRequest(event.message.text);
        request.on('response', function (response) {

            //default response if it doesn't
            if (response.result.metadata.intentName == "Default Fallback Intent") {
                console.log("default response");
                sendMessage(event.sender.id, {text: response.result.fulfillment.speech});
            }
            else if (response.result.action == "smalltalk.greetings") {
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
                }
                else {
                    if (parameters["zip-code"]) {
                        path += "zip=" + parameters["zip-code"];
                    }
                    else if (parameters["geo-city"]) {
                        path += "q=" + parameters["geo-city"];
                    }
                }
                //Check if current weather or forecast is required
                if (parameters["date-period"] == "" || parameters["date-period"] == null || parameters["date-period"] == "now") {
                    time = "current";
                    options = {
                        url: 'http://api.openweathermap.org/data/2.5/weather?appid=' + weatherKey + "&units=imperial&" + path.toString(),
                        method: 'GET'
                    };
                }
                else if ((parameters["date-period"] == "tonight")) {
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
}

function getWeather(event, path, time) {
    
    request(path, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            
            var fbookResponse, temp, city, weather;
            var result = JSON.parse(body);
            console.log(result);

            switch(time){
                case "current":
                    temp = result.main.temp;
                    city = result.name;
                    weather = result.weather[0].description;
                    fbookResponse = "The current weather for " + city + " is " + weather +", The temperature is "+ temp + " fahrenheit";
                    break;

                case "tomorrow":
                    temp = result.list[0].temp.day;
                    city = result.city.name;
                    weather = result.list[0].weather[0].description;
                    fbookResponse = "Tomorrows weather for " + city + " is " + weather +", The temperature will be "+ temp + " fahrenheit";
                    break;

                case "tonight":
                    temp = result.list[0].main.temp;
                    weather = result.list[0].weather[0].description;
                    city = result.city.name;
                    fbookResponse = "Tonights weather for " + city + " is " + weather +", The temperature will be "+ temp + " fahrenheit";
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