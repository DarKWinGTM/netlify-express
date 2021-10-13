'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const router = express.Router();

// router.get('/', (req, res) => {
//   res.writeHead(200, { 'Content-Type': 'text/html' });
//   res.write('<h1>Hello from Express.js!</h1>');
// //   res.end();
// });
// Home route
router.get("/", (req, res) => {
    
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

router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
router.post('/', (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));
app.use('/echo', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.end(`ECHO : ${req.url }`);
});

module.exports = app;
module.exports.handler = serverless(app);
