'use strict';

const Promise = require('bluebird');

class WorkerCounter {
    constructor() {
        this.counter = 0;
    }

    enter() {
        this.counter++;
    }

    exit() {
        this.counter--;
    }

    async waitForEmpty() {
        const self = this;

        function wait(resolve) {
            if (self.counter === 0) {
                resolve();
            } else {
                setTimeout(wait, 500, resolve);
            }
        }

        return new Promise(resolve => {
            setTimeout(wait, 500, resolve);
        });
    }
}

module.exports = WorkerCounter;
