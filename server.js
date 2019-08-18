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

const bodyParser = require("body-parser");

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());

app.get('/system-usage', function(request, response) {

    return response.json(readFile());

})

app.post('/system-usage', function(request, response) {
    const fs = require('fs');
    console.log(request.query.systemUsage);
    fs.writeFile("system-usage", request.query.systemUsage, function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });

    let res = {
        "result": "success"
    }
    return response.json(res);
})

function readFile() {
    const fs = require('fs');
    let content = fs.readFileSync("system-usage").toString();
    let result = {
        "system-usage": content
    }
    return result;
}

app.post('/webhooks', function(request, response) {
    let data = readFile();
    console.log(request.body);
    let usage = request.body.queryResult.parameters['usage'];
    console.log(usage);
    let speach = `Current System usage is ${data['system-usage']}%`;
    response.setHeader('Content-Type', 'application/json');
    let result = "";
    let resObj = {
        "fulfillmentText": "This is a text response",
        "fulfillmentMessages": [{
            "text": {
                "text": [speach]
            }
        }],
        "payload": {
            "google": {
                "expectUserResponse": true,
                "richResponse": {
                    "items": [{
                        "simpleResponse": {
                            "textToSpeech": speach
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
