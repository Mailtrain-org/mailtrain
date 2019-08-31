const path = require('path');

const webpackConf = require('../ivis-core/client/webpack.config');

webpackConf.resolve.modules = ['node_modules', '../ivis-core/client/node_modules'];
webpackConf.entry = {
    'index-trusted': ['@babel/polyfill', './src/root-trusted.js'],
    'index-sandbox': ['@babel/polyfill', '../ivis-core/client/src/root-sandbox.js']
};
webpackConf.output = {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
};

module.exports = webpackConf;