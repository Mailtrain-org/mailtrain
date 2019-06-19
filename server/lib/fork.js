'use strict';

const builtinFork = require('child_process').fork;

const cleanExit = () => process.exit();
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill

const children = [];

process.on('message', msg => {
    if (msg === 'exit') {
        cleanExit();
    }
});


process.on('exit', function() {
    for (const child of children) {
        child.send('exit');
    }
});

function fork(path, args, opts) {
    const child = builtinFork(path, args, opts);

    children.push(child);
    return child;
}

module.exports.fork = fork;
