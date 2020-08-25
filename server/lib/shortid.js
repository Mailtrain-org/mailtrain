"use strict";

// Modules
const nanoid = require('nanoid');
const config = require('./config');

// Default hardcoded values
let alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
let customlength = 10;

// Gets from config if defined
if (config.cid && config.cid.alphabet) alphabet=config.cid.alphabet;
if (config.cid && config.cid.length) customlength=config.cid.length;

// Create custom nanoid
const customnanoid = nanoid.customAlphabet(alphabet, customlength);

const re = new RegExp('['+alphabet+']{'+customlength+'}');

// Implements the public methods of shortid module with nanoid and export them
module.exports.generate = function() {
  return customnanoid();
}

module.exports.isValid = function(id) {
  return re.test(id);
}
