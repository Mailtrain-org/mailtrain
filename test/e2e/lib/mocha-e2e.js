'use strict';

/* eslint-disable no-console */

const Mocha = require('mocha');
const color = Mocha.reporters.Base.color;
const WorkerCounter = require('./worker-counter');
const fs = require('fs-extra');
const config = require('./config');
const webdriver = require('selenium-webdriver');

const driver = new webdriver.Builder()
    .forBrowser(config.app.seleniumwebdriver.browser || 'phantomjs')
    .build();

const failHandlerRunning = new WorkerCounter();

function UseCaseReporter(runner) {
    Mocha.reporters.Base.call(this, runner);

    const self = this;
    let indents = 0;

    function indent () {
        return Array(indents).join('  ');
    }

    runner.on('start', () => {
        console.log();
    });

    runner.on('suite', suite => {
        ++indents;
        console.log(color('suite', '%s%s'), indent(), suite.title);
    });

    runner.on('suite end', () => {
        --indents;
        if (indents === 1) {
            console.log();
        }
    });

    runner.on('use-case', useCase => {
        ++indents;
        console.log();
        console.log(color('suite', '%sUse case: %s'), indent(), useCase.title);
    });

    runner.on('use-case end', () => {
        --indents;
    });

    runner.on('steps', useCase => {
        ++indents;
        console.log(color('pass', '%s%s'), indent(), useCase.title);
    });

    runner.on('steps end', () => {
        --indents;
    });

    runner.on('step pass', step => {
        console.log(indent() + color('checkmark', '  ' + Mocha.reporters.Base.symbols.ok) + color('pass', ' %s'), step.title);
    });

    runner.on('step fail', step => {
        console.log(indent() + color('fail', '  %s'), step.title);
    });

    runner.on('pending', test => {
        const fmt = indent() + color('pending', '  - %s');
        console.log(fmt, test.title);
    });

    runner.on('pass', test => {
        let fmt;
        if (test.speed === 'fast') {
            fmt = indent() +
                color('checkmark', '  ' + Mocha.reporters.Base.symbols.ok) +
                color('pass', ' %s');
            console.log(fmt, test.title);
        } else {
            fmt = indent() +
                color('checkmark', '  ' + Mocha.reporters.Base.symbols.ok) +
                color('pass', ' %s') +
                color(test.speed, ' (%dms)');
            console.log(fmt, test.title, test.duration);
        }
    });

    runner.on('fail', (test, err) => {
        failHandlerRunning.enter();
        (async () => {
            const currentUrl = await driver.getCurrentUrl();
            const info = `URL: ${currentUrl}`;
            await fs.writeFile('last-failed-e2e-test.info', info);
            await fs.writeFile('last-failed-e2e-test.html', await driver.getPageSource());
            await fs.writeFile('last-failed-e2e-test.png', new Buffer(await driver.takeScreenshot(), 'base64'));
            failHandlerRunning.exit();
        })();

        console.log(indent() + color('fail', '  %s'), test.title);
        console.log();
        console.log(err);
        console.log();
        console.log('Snaphot of and info about the current page are in last-failed-e2e-test.*');
    });

    runner.on('end', () => {
        const stats = self.stats;
        let fmt;

        console.log();

        // passes
        fmt = color('bright pass', ' ') + color('green', ' %d passing');
        console.log(fmt, stats.passes);

        // pending
        if (stats.pending) {
            fmt = color('pending', ' ') + color('pending', ' %d pending');
            console.log(fmt, stats.pending);
        }

        // failures
        if (stats.failures) {
            fmt = color('fail', '  %d failing');
            console.log(fmt, stats.failures);
        }

        console.log();
    });
}


const mocha = new Mocha()
    .timeout(120000)
    .reporter(UseCaseReporter)
    .ui('tdd');

mocha._originalRun = mocha.run;


let runner;
mocha.run = fn => {
    runner = mocha._originalRun(async () => {
        await failHandlerRunning.waitForEmpty();
        await driver.quit();

        fn();
    });
};


async function useCaseExec(name, asyncFn) {
    runner.emit('use-case', {title: name});

    try {
        await asyncFn();
        runner.emit('use-case end');
    } catch (err) {
        runner.emit('use-case end');
        throw err;
    }
}

function useCase(name, asyncFn) {
    if (asyncFn) {
        return test('Use case: ' + name, () => useCaseExec(name, asyncFn));
    } else {
        // Pending test
        return test('Use case: ' + name);
    }
}

useCase.only = (name, asyncFn) => test.only('Use case: ' + name, () => useCaseExec(name, asyncFn));

useCase.skip = (name, asyncFn) => test.skip('Use case: ' + name, () => useCaseExec(name, asyncFn));

async function step(name, asyncFn) {
    try {
        await asyncFn();
        runner.emit('step pass', {title: name});
    } catch (err) {
        runner.emit('step fail', {title: name});
        throw err;
    }
}

async function steps(name, asyncFn) {
    try {
        runner.emit('steps', {title: name});
        await asyncFn();
        runner.emit('steps end');
    } catch (err) {
        runner.emit('step end');
        throw err;
    }
}

async function precondition(preConditionName, useCaseName, asyncFn) {
    await steps(`Including use case "${useCaseName}" to satisfy precondition "${preConditionName}"`, asyncFn);
}

module.exports = {
    mocha,
    useCase,
    step,
    steps,
    precondition,
    driver
};
