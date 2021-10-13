//  'use strict';

//  const app = require('./express/server');

//  app.listen(3000, () => console.log('Local app listening on port 3000!'));



'use strict';

const app = require('./express/server');
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

    // Listen on port 5000
    // app.listen(port, () => {
    //     console.log(`Server is booming on port 5000 Visit http://localhost:5000`);
    // }); 
    app.listen(3000, () => console.log('Local app listening on port 3000!'));
    
}; 
