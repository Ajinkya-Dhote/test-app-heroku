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

app.post('/top-process', function(request, response) {
    const fs = require('fs');
    fs.writeFile("top-process", request.body.process, function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });

    let res = {
        "result": "success"
    }
    return response.json(res);
});

function readFile() {
    const fs = require('fs');
    let content = fs.readFileSync("system-usage").toString();
    let result = {
        "system-usage": content
    }
    return result;
}

app.post('/webhooks', function(request, response) {

    console.log(request.body);
    let usage = request.body.queryResult.parameters['usage'];
    let process = request.body.queryResult.parameters['process'];
    response.setHeader('Content-Type', 'application/json');
    let resObj = getDefaultResponse();

    if (usage && (usage === 'cpu' || usage === 'memory')) {
        resObj = getSystemUsage();
    } else if (process && process !== '') {
        resObj = getTopRunningProcess();
    }

    return response.json(resObj);
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

function getDefaultResponse() {
    let speach = "Sorry I didn't understand."
    let resObj = {
        "fulfillmentText": speach,
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
    return resObj;
}

function getSystemUsage() {
    let data = readFile();
    let speach = `Current System usage is ${data['system-usage']}%`;
    let result = "";
    let resObj = {
        "fulfillmentText": " ",
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
    return resObj;
}

function getTopRunningProcess() {
    let speach = readTopProcess();
    let resObj = {
        "fulfillmentText": " ",
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
                        "basic_card": {
                            "title": "Top 5 process",
                            "subtitle": "By CPU and Memory Usage",
                            "imageUri": "https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png",
                            "formatted_text": speach

                        },
                        "simpleResponse": {
                            "textToSpeech": "Here are top 5 Process by CPU and Memory Usage",
                            "textToDisplay": speech
                        }
                    }]
                }
            }
        },
        "source": ""
    };
    return resObj;
}

function readTopProcess() {
    const fs = require('fs');
    let content = fs.readFileSync("top-process").toString();
    return content;
}
