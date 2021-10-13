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











const cluster   = require("cluster"); 
const cpuCount  = require("os").cpus().length //returns no of cores our cpu have

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
  //  const express   = require("express")
  //  const app       = express()
  const app       = require('./express/server'); 
  
  //workers can share TCP connection
  app.get("/", (req, res) => {
    res.send(`hello from server ${process.pid}`)
  })
  app.listen(3000, () =>
    console.log(`server ${process.pid} listening on port 5555`)
  )
}; 
