'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const router = express.Router();

// Home route
router.get('/', (req, res) =>  'text/html' });
    //  sets the header of the response to the user and the type of response that you would be sending back
    res.setHeader('Content-Type', 'text/html');
    res.write("<html>"); 
    res.write("<head>"); 
    res.write("<title>now-express</title>"); 
    res.write("</head>"); 
    res.write("<body>"); 
    res.write("<h1>now-express</h1>"); 
    res.write("</body>"); 
    res.write("<html>"); 
    res.end(); 
});
CHO : ${req.url }`);
});

// Serverless
app.use('/.netlify/functions/index', router);
module.exports.handler = serverless(app);
