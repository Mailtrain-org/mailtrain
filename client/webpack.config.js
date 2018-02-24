const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: {
        namespaces: ['babel-polyfill', './src/namespaces/root.js'],
        users: ['babel-polyfill', './src/users/root.js'],
        account: ['babel-polyfill', './src/account/root.js'],
        reports: ['babel-polyfill', './src/reports/root.js'],
        lists: ['babel-polyfill', './src/lists/root.js'],
        templates: ['babel-polyfill', './src/templates/root.js'],
        blacklist: ['babel-polyfill', './src/blacklist/root.js']
    },
    output: {
        library: 'MailtrainReactBody',
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(disposables|react-dnd-touch-backend)/ /* https://github.com/react-dnd/react-dnd/issues/407 */,
                use: [ 'babel-loader' ]
            },
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [ 
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192 // inline base64 URLs for <=8k images, direct URLs for the rest
                        }
                    }
                ] 
            }, 
            {
                test: /\.scss$/,
                exclude: path.join(__dirname, 'node_modules'),
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            localIdentName: '[path][name]__[local]--[hash:base64:5]'
                        }
                    },
                    'sass-loader' ]
            },
            {
                test: /\.(woff|ttf|eot)$/,
                use: [ 'url-loader' ]
            }
        ]
    },
    externals: {
        $: "jQuery",
        jquery: 'jQuery',
        csfrToken: 'csfrToken',
        mailtrainConfig: 'mailtrainConfig'
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
