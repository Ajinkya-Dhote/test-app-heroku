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

app.post('/ip', function(request, response) {
    const fs = require('fs');
    fs.writeFile("ip", request.body.process, function(err) {
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

    console.log(request.body);
    let usage = request.body.queryResult.parameters['usage'];
    let process = request.body.queryResult.parameters['process'];
    let ip = request.body.queryResult.parameters['ip'];
    response.setHeader('Content-Type', 'application/json');
    let resObj = getDefaultResponse();

    if (usage && usage !== '') {
        resObj = getSystemUsage();
    } else if (process && process !== '') {
        resObj = getTopRunningProcess();
    } else (ip & ip !== '') {
        resObj = getPiIp();
    }

    return response.json(resObj);
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

function getDefaultResponse() {
    let speach = "You can ask me to Know the System usage or to know about top running process"
    let resObj = {
        "payload": {
            "google": {
                "expectUserResponse": true,
                "richResponse": {
                    "items": [{
                        "simpleResponse": {
                            "textToSpeech": speach
                        }
                    },
                    {
                        "basicCard": {
                            "title": "Raspberry PI",
                            "subtitle": "Know top running status of your Raspberry PI",
                            "formattedText": "You can ask for  \n 1. CPU Usage.  \n 2. System Usage.  \n 3. Top Running Process on your PI",
                            "image": {
                                "url": "https://www.raspberrypi.org/wp-content/uploads/2011/10/Raspi-PGB001.png",
                                "accessibilityText": "Rasp PI"
                            },
                            "imageDisplayOptions": "CROPPED"
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
        "payload": {
            "google": {
                "expectUserResponse": true,
                "richResponse": {
                    "items": [{
                            "simpleResponse": {
                                "textToSpeech": "Here are Top Running Process"
                            }
                        },
                        {
                            "basicCard": {
                                "title": "Top PROCESSING",
                                "subtitle": "Base on Memory and CPU Usage",
                                "formattedText": speach,
                                "image": {
                                    "url": "https://www.raspberrypi.org/wp-content/uploads/2011/10/Raspi-PGB001.png",
                                    "accessibilityText": "Ajinkya"
                                },
                                "imageDisplayOptions": "CROPPED"
                            }
                        }
                    ]
                }
            }
        }
    }
    return resObj;
}

function readTopProcess() {
    const fs = require('fs');
    let content = fs.readFileSync("top-process").toString();
    return content;
}

function getPiIp() {
    let speach = readPiIP();
    let resObj = {
        "payload": {
            "google": {
                "expectUserResponse": true,
                "richResponse": {
                    "items": [{
                            "simpleResponse": {
                                "textToSpeech": "The Ip of your Raspbery Pi device is " + speech
                            }
                        }
                    ]
                }
            }
        }
    }
    return resObj;
}

function readPiIP() {
    const fs = require('fs');
    let content = fs.readFileSync("ip").toString();
    return content;
}
