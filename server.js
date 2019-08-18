var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    response.render('pages/index');
});

app.post('/webhooks', function(request, response) {
    response.setHeader('Content-Type', 'application/json');
    let result = "";
    let resObj = {
        "fulfillmentText": "This is a text response",
        "fulfillmentMessages": [{
            "text": {
                "text": ["Hi am i am from webhook"]
            }
        }],
        "payload": {
            "google": {
                "expectUserResponse": true,
                "richResponse": {
                    "items": [{
                        "simpleResponse": {
                            "textToSpeech": "this is a simple response from webhook"
                        }
                    }]
                }
            }
        },
        "source": ""
    };
    return response.json(resObj);
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
