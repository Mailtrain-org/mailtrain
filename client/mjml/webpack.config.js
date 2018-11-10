const webpack = require('webpack');
const path = require('path');


module.exports = {
    entry: {
        "mjml": ['./mjml-git/packages/mjml/src/index'],
    },
    output: {
        library: 'mjml',
        filename: '[name].js',
        path: path.resolve(__dirname, './dist'),
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    resolve: {
        alias: {
            'mjml-core/lib': path.resolve(__dirname, './mjml-git/packages/mjml-core/src'),
            'mjml-accordion': path.resolve(__dirname, './mjml-git/packages/mjml-accordion/src'),
            'mjml-body': path.resolve(__dirname, './mjml-git/packages/mjml-body/src'),
            'mjml-button': path.resolve(__dirname, './mjml-git/packages/mjml-button/src'),
            'mjml-carousel': path.resolve(__dirname, './mjml-git/packages/mjml-carousel/src'),
            'mjml-cli': path.resolve(__dirname, './mjml-git/packages/mjml-cli/src'),
            'mjml-column': path.resolve(__dirname, './mjml-git/packages/mjml-column/src'),
            'mjml-core': path.resolve(__dirname, './mjml-git/packages/mjml-core/src'),
            'mjml-divider': path.resolve(__dirname, './mjml-git/packages/mjml-divider/src'),
            'mjml-group': path.resolve(__dirname, './mjml-git/packages/mjml-group/src'),
            'mjml-head': path.resolve(__dirname, './mjml-git/packages/mjml-head/src'),
            'mjml-head-attributes': path.resolve(__dirname, './mjml-git/packages/mjml-head-attributes/src'),
            'mjml-head-breakpoint': path.resolve(__dirname, './mjml-git/packages/mjml-head-breakpoint/src'),
            'mjml-head-font': path.resolve(__dirname, './mjml-git/packages/mjml-head-font/src'),
            'mjml-head-preview': path.resolve(__dirname, './mjml-git/packages/mjml-head-preview/src'),
            'mjml-head-style': path.resolve(__dirname, './mjml-git/packages/mjml-head-style/src'),
            'mjml-head-title': path.resolve(__dirname, './mjml-git/packages/mjml-head-title/src'),
            'mjml-hero': path.resolve(__dirname, './mjml-git/packages/mjml-hero/src'),
            'mjml-image': path.resolve(__dirname, './mjml-git/packages/mjml-image/src'),
            'mjml-migrate': path.resolve(__dirname, './mjml-git/packages/mjml-migrate/src/migrate.js'),
            'mjml-navbar': path.resolve(__dirname, './mjml-git/packages/mjml-navbar/src'),
            'mjml-raw': path.resolve(__dirname, './mjml-git/packages/mjml-raw/src'),
            'mjml-section': path.resolve(__dirname, './mjml-git/packages/mjml-section/src'),
            'mjml-social': path.resolve(__dirname, './mjml-git/packages/mjml-social/src'),
            'mjml-spacer': path.resolve(__dirname, './mjml-git/packages/mjml-spacer/src'),
            'mjml-table': path.resolve(__dirname, './mjml-git/packages/mjml-table/src'),
            'mjml-text': path.resolve(__dirname, './mjml-git/packages/mjml-text/src'),
            'mjml-validator': path.resolve(__dirname, './mjml-git/packages/mjml-validator/src'),
            'mjml-wrapper': path.resolve(__dirname, './mjml-git/packages/mjml-wrapper/src'),
            'mjml-parser-xml': path.resolve(__dirname, './mjml-git/packages/mjml-parser-xml/src'),
            'fs': path.resolve(__dirname, 'mocks/fs'),
            'uglify-js': path.resolve(__dirname, 'mocks/uglify-js'),
        }
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
                                ['env', {
                                    targets: {
                                        "chrome": "58",
                                        "edge": "15",
                                        "firefox": "55",
                                        "ios": "10"
                                    }
                                }],
                                'stage-1'
                            ],
                            plugins: ['add-module-exports', 'transform-react-jsx', 'transform-decorators-legacy', 'transform-function-bind'],
                            babelrc: false
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
