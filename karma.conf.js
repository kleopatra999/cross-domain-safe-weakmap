var argv = require('yargs').argv;
var path = require('path');
var webpack = require('webpack');

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: __dirname,

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [
            'mocha',
            'sinon-chai'
        ],

        // list of files / patterns to load in the browser
        files: [
            { pattern: 'node_modules/babel-polyfill/dist/polyfill.js', included: true, served: true },
            { pattern: 'test/test.js', included: true, served: true }
        ],

        plugins: [
            require('karma-webpack'),
            require('karma-mocha'),
            require('karma-phantomjs-launcher'),
            require('karma-chrome-launcher'),
            require('karma-safari-launcher'),
            require('karma-firefox-launcher'),
            require('karma-ie-launcher'),
            require('karma-sinon-chai'),
            require('karma-coverage'),
            require('karma-spec-reporter'),
            require('karma-sourcemap-loader')
        ],

        webpackMiddleware: {
            noInfo: true,
            stats: false
        },

        webpack: {
            devtool: 'inline-source-map',

            resolve: {
                root: [
                    __dirname
                ],

                modulesDirectories: [
                    'node_modules'
                ]
            },

            module: {
                loaders: [
                    {
                        test: /\.js$/,
                        exclude: /(dist|chai)/,
                        loader: 'babel',
                        query: {
                            presets: ['es2015'],
                            plugins: [
                                'transform-flow-strip-types',
                                'transform-es3-property-literals',
                                'transform-es3-member-expression-literals',
                                'transform-class-properties',
                                ['transform-es2015-for-of', {loose: true}],
                                ['flow-runtime', {
                                    'assert': true,
                                    'annotate': true
                                }],
                                [ '__coverage__', { only: `${__dirname}/src` } ]
                            ]
                        }
                    },
                    {
                        test: /\.(html?|css|json)$/,
                        loader: 'raw-loader'
                    }
                ]
            },
            bail: false,
            plugins: [
                new webpack.DefinePlugin({
                    __TEST__: true
                })
            ]
        },


        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'test/test.js': ['webpack', 'sourcemap'],
            'test/windows/**/*.js': ['webpack', 'sourcemap'],
            'src/**/*.js': ['coverage',  'sourcemap']
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: [
            'spec',
            'coverage'
        ],

        coverageReporter: {

            instrumenterOptions: {
                istanbul: { noCompact: true }
            },

            reporters: [
                {
                    type: 'text'
                },
                {
                    type : 'html',
                    dir : 'coverage/',
                    subdir: '.'
                }
            ]
        },


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: (argv.browser && argv.browser.split(',')) || ['PhantomJS'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
};
