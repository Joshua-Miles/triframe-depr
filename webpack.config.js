const path = require('path');
const nodeExternals = require('webpack-node-externals');
const externals = [{ 'fs': 'commonjs fs', 'child_process': 'commonjs child_process', 'http': 'commonjs http', 'triframe/core': 'commonjs triframe/core' }, nodeExternals()]

const moduleConfig = {
    rules: [
        {
            test: /\.m?js$/,
            exclude: path => (path.includes('node_modules') || path.includes('bower_components')),
            use: {
                loader: 'babel-loader',
                options: {
                    babelrc: false,
                    configFile: false,
                    presets: ['@babel/preset-env'],
                    plugins: [
                        "@babel/plugin-transform-runtime",
                        "@babel/plugin-proposal-optional-chaining",
                        "@babel/plugin-proposal-object-rest-spread",
                        ["@babel/plugin-proposal-decorators", {
                            decoratorsBeforeExport: true
                        }],
                        "@babel/plugin-proposal-class-properties",
                    ]
                }
            }
        }
    ]
}


const coreConfig = {
    entry: './src/core/index.js',
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname),
        filename: 'core.js',
    },
    externals,
    module: moduleConfig
};

const scribeConfig = {
    entry: './src/scribe/index.js',
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname),
        filename: 'scribe.js',
    },
    externals,
    module: moduleConfig
};

const masonConfig = {
    entry: './src/mason/index.js',
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname),
        filename: 'mason.js',
    },
    externals,
    module: moduleConfig
};

const arbiterConfig = {
    entry: './src/arbiter/index.js',
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname),
        filename: 'arbiter.js',
    },
    externals,
    module: moduleConfig
};

const arbiterWebConfig = {
    entry: './src/arbiter/index.js',
    resolve: {
        extensions: ['.web.js', '.client.js', '.js'],
    },
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname),
        filename: 'arbiter.web.js',
    },
    externals,
    module: moduleConfig
};

const arbiterAndroidConfig = {
    entry: './src/arbiter/index.js',
    resolve: {
        extensions: ['.android.js', '.client.js', '.js'],
    },
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname),
        filename: 'arbiter.android.js',
    },
    externals,
    module: moduleConfig
};

const arbiterIosConfig = {
    entry: './src/arbiter/index.js',
    resolve: {
        extensions: ['.ios.js', '.client.js', '.js'],
    },
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname),
        filename: 'arbiter.ios.js',
    },
    externals,
    module: moduleConfig
};

const designerWebConfig = {
    entry: './src/designer/index.js',
    resolve: {
        extensions: ['.web.js', '.js'],
    },
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname),
        filename: 'designer.web.js',
    },
    externals: [...externals, {
        'react': 'commonjs react',
        'react-native': 'commonjs react-native',
        '@expo/vector-icons': 'commonjs @expo/vector-icons'
    }],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: path => (path.includes('node_modules') || path.includes('bower_components')),
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        configFile: false,
                        presets: ['module:metro-react-native-babel-preset'],
                        plugins: [
                            "@babel/plugin-transform-runtime",
                            "@babel/plugin-proposal-optional-chaining",
                            "@babel/plugin-proposal-object-rest-spread",
                            ["@babel/plugin-proposal-decorators", {
                                decoratorsBeforeExport: true
                            }],
                            "@babel/plugin-proposal-class-properties",
                        ]
                    }
                }
            }
        ]
    }
};

const designerIosConfig = {
    entry: './src/designer/index.js',
    resolve: {
        extensions: ['.ios.js', '.native.js', '.js'],
    },
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname),
        filename: 'designer.ios.js',
    },
    externals: [...externals, {
        'react': 'react',
        'react-native': 'react-native',
        '@expo/vector-icons': '@expo/vector-icons'
    }],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: path => (path.includes('node_modules') || path.includes('bower_components')),
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        configFile: false,
                        presets: ['module:metro-react-native-babel-preset'],
                        plugins: [
                            "@babel/plugin-transform-runtime",
                            "@babel/plugin-proposal-optional-chaining",
                            "@babel/plugin-proposal-object-rest-spread",
                            ["@babel/plugin-proposal-decorators", {
                                decoratorsBeforeExport: true
                            }],
                            "@babel/plugin-proposal-class-properties",
                        ]
                    }
                }
            }
        ]
    }
};

const designerAndroidConfig = {
    entry: './src/designer/index.js',
    resolve: {
        extensions: ['.android.js', '.native.js', '.js'],
    },
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname),
        filename: 'designer.android.js',
    },
    externals: [...externals, {
        'react': 'react',
        'react-native': 'react-native',
        '@expo/vector-icons': '@expo/vector-icons'
    }],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: path => (path.includes('node_modules') || path.includes('bower_components')),
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        configFile: false,
                        presets: ['module:metro-react-native-babel-preset'],
                        plugins: [
                            "@babel/plugin-transform-runtime",
                            "@babel/plugin-proposal-optional-chaining",
                            "@babel/plugin-proposal-object-rest-spread",
                            ["@babel/plugin-proposal-decorators", {
                                decoratorsBeforeExport: true
                            }],
                            "@babel/plugin-proposal-class-properties",
                        ]
                    }
                }
            }
        ]
    }
};

module.exports = [coreConfig, scribeConfig, masonConfig, arbiterConfig, arbiterWebConfig, arbiterAndroidConfig, arbiterIosConfig, designerWebConfig, designerIosConfig, designerAndroidConfig] 