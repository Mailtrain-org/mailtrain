'use strict';

const Mocha = require('mocha');
const color = Mocha.reporters.Base.color;

function UseCaseReporter(runner) {
    Mocha.reporters.Base.call(this, runner);

    const self = this;
    let indents = 0;

    function indent () {
        return Array(indents).join('  ');
    }

    runner.on('start', function () {
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
        if (indents === 1) {
            console.log();
        }
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

    runner.on('fail', test => {
        console.log(indent() + color('fail', '  %s'), test.title);
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
    .reporter(UseCaseReporter);

mocha._originalRun = mocha.run;

let runner;
mocha.run = fn => {
    runner = mocha._originalRun(fn);
}

async function useCase(name, asyncFn) {
    it('Use case: ' + name, async () => {
        runner.emit('use-case', {title: name});

        try {
            await asyncFn();
            runner.emit('use-case end');
        } catch (err) {
            runner.emit('use-case end');
            console.err(err);
            throw err;
        }
    });
}

async function step(name, asyncFn) {
    try {
        await asyncFn();
        runner.emit('step pass', {title: name});
    } catch (err) {
        runner.emit('step fail', {title: name});
        console.err(err);
        throw err;
    }
}

module.exports = {
    mocha,
    useCase,
    step
};