const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: {
        namespaces: ['babel-polyfill', './src/namespaces/root.js'],
        users: ['babel-polyfill', './src/users/root.js']
    },
    output: {
        library: 'MailtrainReactBody',
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {test: /\.(js|jsx)$/, use: 'babel-loader'},
            {test: /\.css$/, loader: 'style-loader!css-loader'},
            {test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=8192' } // inline base64 URLs for <=8k images, direct URLs for the rest
        ]
    },
    externals: {
        jquery: 'jQuery',
        csfrToken: 'csfrToken'
    },
    plugins: [
//        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.CommonsChunkPlugin('common')
    ],
    watchOptions: {
        ignored: 'node_modules/',
        poll: 1000
    }
};
