'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');

const crypto                                = require('crypto');
const { Api, JsonRpc, Serialize }           = require('eosjs');
const { JsSignatureProvider, PrivateKey }   = require('eosjs/dist/eosjs-jssig');
//  const fetch                                 = require('node-fetch');
const { TextEncoder, TextDecoder }          = require('text-encoding');
const url                                   = require('url');
const fs                                    = require('fs'); 

const app   = express(); 
const router = express.Router();

const privateKeys = ['5KJEamqm4QT2bmDwQEmRAB3EzCrCmoBoX7f6MRdrhGjGgHhzUyf']; 
const signatureProvider = new JsSignatureProvider(privateKeys);

router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});

router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
// echo route
router.get('/echo', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.end(`ECHO : ${req.url }`);
});
// mine API
router.get("/mine", (req, res) => {
    if(
        req.url.match('mine') && 
        req.url.match('waxaccount') && 
        req.url.match('difficulty') && 
        req.url.match('lastMineTx') && 
        url.parse(req.url,true).query && 
        url.parse(req.url,true).query.waxaccount && 
        url.parse(req.url,true).query.difficulty && 
        url.parse(req.url,true).query.lastMineTx
    ){
        
        console.log( req.url ); 
        console.log( url.parse(req.url,true).query.waxaccount ); 
        mine({
            'waxaccount' : url.parse(req.url,true).query.waxaccount, 
            'difficulty' : url.parse(req.url,true).query.difficulty, 
            'lastMineTx' : url.parse(req.url,true).query.lastMineTx
        }).then(result => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
        }); 
        
    }else{
        res.setHeader('Content-Type', 'text/html');
        res.send('?');
    }; 
});
router.post('/', (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);



async function mine(DATA){

    const nameToArray = (name) => {
        const sb = new Serialize.SerialBuffer({
            textEncoder: new TextEncoder,
            textDecoder: new TextDecoder
        }); sb.pushName(name); return sb.array; 
    }; 

    const getRand = () => {
        const arr = new Uint8Array(8); 
        for (let i=0; i < 8; i++){
            const rand = Math.floor(Math.random() * 255); 
            arr[i] = rand; 
        }; return arr; 
    }; 
    const toHex = (buffer) => {
        return [...new Uint8Array (buffer)]
        .map (b => b.toString (16).padStart (2, "0"))
        .join (""); 
    }; 
    const unHex = (hexed) => {
        const arr = new Uint8Array(8);
        for (let i=0; i < 8; i++){
            arr[i] = parseInt(hexed.slice(i*2, (i+1)*2), 16); 
        }; return arr; 
    }; 
    
    let good = false, itr = 0;
    
    while (!good){
      
        //  rand_arr = getRand();
      
        itr++;
        if (itr >= 100000 * 10){
            break; 
        }; 

    }; 
    
    
    return new Promise(function(resolve, reject) {
        resolve({account:'', nonce:'', answer:''}); 
    });
}; 
