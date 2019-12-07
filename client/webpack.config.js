const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'development',
    plugins: [
    ],
    entry: {
        "root": ['./src/root.js'],
        "mosaico-root": ['./src/lib/sandboxed-mosaico-root.js'],
        "ckeditor-root": ['./src/lib/sandboxed-ckeditor-root.js'],
        "grapesjs-root": ['./src/lib/sandboxed-grapesjs-root.js'],
        "codeeditor-root": ['./src/lib/sandboxed-codeeditor-root.js'],
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
                exclude: path.join(__dirname, 'node_modules'),
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    targets: {
                                        "chrome": "58",
                                        "edge": "15",
                                        "firefox": "55",
                                        "ios": "10"
                                    }
                                }],
                                '@babel/preset-react'
                            ],
                            plugins: [
                                ["@babel/plugin-proposal-decorators", { "legacy": true }],
                                ["@babel/plugin-proposal-class-properties", { "loose" : true }],
                                "@babel/plugin-proposal-function-bind"
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    }
                ]
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
                    'sass-loader'
                ]
            },
            {
                test: /\.(svg|otf|woff2|woff|ttf|eot)$/,
                use: [
                    'url-loader'
                ]
            }
        ]
    },
    externals: {
        jquery: 'jQuery',
        csrfToken: 'csrfToken',
        mailtrainConfig: 'mailtrainConfig'
    },
    plugins: [
      new CopyPlugin([
        { from: './node_modules/jquery/dist/jquery.min.js', to: path.resolve(__dirname, 'dist') },
        { from: './node_modules/popper.js/dist/umd/popper.min.js', to: path.resolve(__dirname, 'dist') },
        { from: './node_modules/bootstrap/dist/js/bootstrap.min.js', to: path.resolve(__dirname, 'dist') },
        { from: './node_modules/@coreui/coreui/dist/js/coreui.min.js', to: path.resolve(__dirname, 'dist') },
        { from: './node_modules/@fortawesome/fontawesome-free/webfonts/', to: path.resolve(__dirname, 'dist', 'webfonts'), toType: 'dir'}
      ]),
    ],
    watchOptions: {
        ignored: 'node_modules/',
        poll: 2000
    }
};
