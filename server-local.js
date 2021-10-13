'use strict';

//				const app       = require('./express/server');
//				const cpus      = require('os').cpus();
//				const cluster   = require('cluster');
//				
//				const nodeType  = (cluster.isMaster) ? 'Master' : 'Worker';
//				
//				if (cluster.isMaster) {
//				    for (let i = 0; i < 4; i++) {
//				        cluster.fork();
//				    }; 
//				    cluster.on('exit', (worker, code, signal) => {
//				        console.log('Worker #' + worker.process.pid, 'exited');
//				        cluster.fork();
//				    }); 
//				} else {
//				    app.listen(3000, () => console.log('Local app listening on port 3000!'));
//				}; 
//				
//				console.log(nodeType + ' #' + process.pid, 'is running');


'use strict';
const express     = require('express');
const path        = require('path');
const serverless  = require('serverless-http');
const bodyParser  = require('body-parser');

const crypto                                = require('crypto');
const { Api, JsonRpc, Serialize }           = require('eosjs');
const { JsSignatureProvider, PrivateKey }   = require('eosjs/dist/eosjs-jssig');
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
  masterProcess()
} else {
  childProcess()
}; 

function masterProcess() {
  
  console.log(`Master process ${process.pid} is running`)
  
  for (let i = 0; i < cpuCount; i++) {
    console.log(`Forking process number ${i}...`)
    cluster.fork() //creates new node js processes
  }; 
  
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`)
    cluster.fork() //forks a new process if any process dies
  }); 
  
}; 

function childProcess() {

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
	
  app.listen(3000, () =>
    console.log(`server ${process.pid} listening on port 3000`)
  )
}; 
