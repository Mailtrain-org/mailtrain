'use strict';

function usernameValid(username) {
    return /^[a-zA-Z0-9][a-zA-Z0-9_\-.]*$/.test(username);
}

module.exports = {
    usernameValid
};