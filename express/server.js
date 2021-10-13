'use strict';
const express     = require('express');
const path        = require('path');
const serverless  = require('serverless-http');
const bodyParser  = require('body-parser');

const crypto                                = require('crypto');
const { Api, JsonRpc, Serialize }           = require('eosjs');
const { JsSignatureProvider, PrivateKey }   = require('eosjs/dist/eosjs-jssig');
//  const fetch                                 = require('node-fetch');
const cpus                                  = require('os').cpus();
const cluster                               = require('cluster');
const { TextEncoder, TextDecoder }          = require('text-encoding');
const url                                   = require('url');
const fs                                    = require('fs'); 

const nodeType  = (cluster.isMaster) ? 'Master' : 'Worker';

const app     = express(); 
const router  = express.Router();

const privateKeys = ['5KJEamqm4QT2bmDwQEmRAB3EzCrCmoBoX7f6MRdrhGjGgHhzUyf']; 
const signatureProvider = new JsSignatureProvider(privateKeys);

if (cluster.isMaster) {
    for (let i = 0; i < 4; i++) {
        cluster.fork();
    }; 
    cluster.on('exit', (worker, code, signal) => {
        console.log('Worker #' + worker.process.pid, 'exited');
        cluster.fork();
    }); 
} else {

	router.get('/', (req, res) => {
        //  res.writeHead(200, { 'Content-Type': 'text/html' });
        //  res.write('<h1>Hello from Express.js!</h1>');
        //  res.end();
        res.setHeader('Content-Type', 'text/html');
        res.write("<html>"); 
        res.write("<head>"); 
        res.write(`<title>now-express</title>`); 
        res.write("</head>"); 
        res.write("<body>"); 
        res.write(`<h1>now-express ${ process.pid }</h1>`); 
        res.write("</body>"); 
        res.write("<html>"); 
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
	app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html

	module.exports = app;
	module.exports.handler = serverless(app);
                                          
}; 

















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
    
    var mining_account  = 'm.federation'; 
    var account         = nameToArray( DATA.waxaccount ); account = account.slice(0, 8); 
    var account_str     = DATA.waxaccount ; 
    var difficulty      = DATA.difficulty; 
    var last_mine_tx    = DATA.lastMineTx.substr(0, 16); 
    var last_mine_arr   = unHex(last_mine_tx); 
    
    const is_wam = account_str.substr(-4) === '.wam';
  
    let good = false, itr = 0, rand = 0
    var hash, hex_digest, rand_arr, last;
    
    console.log(`Performing work with difficulty ${difficulty}, last tx is ${last_mine_tx}...`);
  
    if (is_wam){
        console.log(`Using WAM account`);
    }; 
    
    const start = (new Date()).getTime();
    
    while (!good){
      
        var rand_arr = getRand();
        
        const combined = new Uint8Array(account.length + last_mine_arr.length + rand_arr.length);
        combined.set(account);
        combined.set(last_mine_arr, account.length);
        combined.set(rand_arr, account.length + last_mine_arr.length);

        hash = await crypto.createHash('sha256').update( combined.slice(0, 24) ).digest('Uint8Array');
        hex_digest = toHex(hash);
        
        if (is_wam){
            good = hex_digest.substr(0, 4) === '0000';
        } else {
            good = hex_digest.substr(0, 6) === '000000';
        }; 
        
        if (good){
            if (is_wam){
                last = parseInt(hex_digest.substr(4, 1), 16);
            } else {
                last = parseInt(hex_digest.substr(6, 1), 16);
            }; good &= (last <= difficulty);
        }; 
        
        itr++;
        
        if (itr % 10000 === 0){
            console.log(`Still mining - tried ${itr} iterations ${((new Date()).getTime()-start) / 1000}s`);
        }; 
        
        if (!good){ hash = null }; 
        
        if (itr >= 100000 * 5){
            rand_arr    = ''; 
            hex_digest  = `SORRY WE CAN NOT SOLVED LOOP ${ itr }`; 
            break; 
        }; 

    }; 
    
    const end       = (new Date()).getTime();
    const rand_str  = toHex(rand_arr);
    
    console.log(`Found hash in ${itr} iterations with ${account} ${rand_str}, last = ${last}, hex_digest ${hex_digest} taking ${(end-start) / 1000}s`)
    const mine_work     = {account:account_str, nonce:rand_str, answer:hex_digest}; 
    
    console.log( mine_work ); 
    
    return new Promise(function(resolve, reject) {
        resolve({account:account_str, nonce:rand_str, answer:hex_digest, process:process.pid}); 
    });
  
}; 
