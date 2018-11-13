const webpack = require('webpack');
const path = require('path');

// The CKEditor part comes from https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/advanced-setup.html
const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = {
    plugins: [
        new CKEditorWebpackPlugin( {
            // See https://ckeditor.com/docs/ckeditor5/latest/features/ui-language.html
            language: 'en'
        } )
    ],
    entry: {
        "root": ['babel-polyfill', './src/root.js'],
        "mosaico-root": ['babel-polyfill', './src/lib/sandboxed-mosaico-root.js'],
        "ckeditor-root": ['babel-polyfill', './src/lib/sandboxed-ckeditor-root.js'],
        "grapesjs-root": ['babel-polyfill', './src/lib/sandboxed-grapesjs-root.js'],
        "codeeditor-root": ['babel-polyfill', './src/lib/sandboxed-codeeditor-root.js'],
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
                            plugins: ['transform-react-jsx', 'transform-decorators-legacy', 'transform-function-bind']
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
                test: /ckeditor5-[^/]+\/theme\/icons\/[^/]+\.svg|ckeditor-insert-image\.svg$/,
                use: [
                    'raw-loader'
                ]
            },
            {
                test: /\.(svg|otf|woff2|woff|ttf|eot)$/,
                exclude: /ckeditor5-[^/]+\/theme\/icons\/[^/]+\.svg|ckeditor-insert-image\.svg$/,
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
        new webpack.optimize.CommonsChunkPlugin('common')
    ],
    watchOptions: {
        ignored: 'node_modules/',
        poll: 2000
    }
};
