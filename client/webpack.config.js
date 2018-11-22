const webpack = require('webpack');
const path = require('path');

/* Excluded. It's not very useful and just eats a lot of space in the resulting JS.
// The CKEditor part comes from https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/advanced-setup.html
const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );
*/

module.exports = {
    mode: 'development',
    plugins: [
/*
        new CKEditorWebpackPlugin( {
            // See https://ckeditor.com/docs/ckeditor5/latest/features/ui-language.html
            language: 'en'
        } )
*/
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
/*
            {
                test: /ckeditor5-[^/]+\/theme\/[\w-/]+\.css$/,
                use: [
                    {
                        loader: 'postcss-loader',
                        options: styles.getPostCssConfig( {
                            themeImporter: {
                                themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
                            },
                            minify: true
                        } )
                    }
                ]
            },
*/
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
/*
            {
                test: /ckeditor5-[^/]+\/theme\/icons\/[^/]+\.svg|ckeditor-insert-image\.svg$/,
                use: [
                    'raw-loader'
                ]
            },
*/
            {
                test: /\.(svg|otf|woff2|woff|ttf|eot)$/,
                // exclude: /ckeditor5-[^/]+\/theme\/icons\/[^/]+\.svg|ckeditor-insert-image\.svg$/,
                use: [
                    'url-loader'
                ]
            }
        ]
    },
    externals: {
        jquery: 'jQuery',
        csfrToken: 'csfrToken',
        mailtrainConfig: 'mailtrainConfig'
    },
    plugins: [
//        new webpack.optimize.UglifyJsPlugin(),
    ],
    watchOptions: {
        ignored: 'node_modules/',
        poll: 2000
    }
};
