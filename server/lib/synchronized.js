'use strict';

// This implements a simple wrapper around an async function that prevents concurrent execution of the function from two asynchronous chains
// It enforces that the running execution has to complete first before another one is started.
function synchronized(asyncFn) {
    let ensurePromise = null;

    return async (...args) => {
        while (ensurePromise) {
            try {
                await ensurePromise;
            } catch (err) {
            }
        }

        ensurePromise = asyncFn(...args);

        try {
            return await ensurePromise;
        } finally {
            ensurePromise = null;
        }
    }
}

module.exports = synchronized;