'use strict';

const app       = require('./express/server');
const cpus      = require('os').cpus();
const cluster   = require('cluster');

const nodeType  = (cluster.isMaster) ? 'Master' : 'Worker';

if (cluster.isMaster) {
    for (let i = 0; i < 4; i++) {
        cluster.fork();
    }; 
    cluster.on('exit', (worker, code, signal) => {
        console.log('Worker #' + worker.process.pid, 'exited');
        cluster.fork();
    }); 
} else {
    app.listen(3000, () => console.log('Local app listening on port 3000!'));
}; 

console.log(nodeType + ' #' + process.pid, 'is running');
