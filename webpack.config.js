const path = require('path');
const nodeExternals = require('webpack-node-externals');
const externals = [{ 'fs': 'commonjs fs', 'child_process': 'commonjs child_process', 'http': 'commonjs http', 'triframe/core': 'commonjs triframe/core', 'triframe/scribe': 'commonjs triframe/scribe' }, nodeExternals()]

const serverConfig = {
    externals,
    node: {
        process: false,
        __dirname: false
    },
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
}

const clientConfig = {
    externals: [...externals, {
        'react': 'commonjs react',
        'react-native': 'commonjs react-native',
        '@expo/vector-icons': 'commonjs @expo/vector-icons',
        'expo-constants': 'commonjs expo-constants'
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
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader'
                ] // compiles Less to CSS
            },

            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ] // compiles Less to CSS
            }
        ]
    }
}


const libraries = [
    { name: 'core', platforms: ['server', 'web', 'ios', 'android'] },
    { name: 'arbiter', platforms: ['server', 'web', 'ios', 'android'] },
    { name: 'scribe', platforms: ['server',] },
    { name: 'mason', platforms: ['server',] },
    { name: 'designer', platforms: ['web', 'ios', 'android'] },
]



module.exports = libraries.reduce((configs, { name, platforms }) => {
    if (platforms.includes('server')) configs.push({
        entry: `./src/${name}/index.js`,
        resolve: {
            extensions: ['.server.js', '.js'],
        },
        output: {
            libraryTarget: 'commonjs2',
            path: path.resolve(__dirname, name),
            filename: 'index.js',
        },
        ...serverConfig
    })

    if (platforms.includes('web')) configs.push({
        entry: `./src/${name}/index.js`,
        resolve: {
            extensions: ['.web.js', '.client.js', '.js'],
        },
        output: {
            libraryTarget: 'commonjs2',
            path: path.resolve(__dirname, name),
            filename: 'index.web.js',
        },
        ...clientConfig
    })

    if (platforms.includes('android')) configs.push({
        entry: `./src/${name}/index.js`,
        resolve: {
            extensions: ['.android.js', '.native.js', '.client.js', '.js'],
        },
        output: {
            libraryTarget: 'commonjs2',
            path: path.resolve(__dirname, name),
            filename: 'index.android.js',
        },
        ...clientConfig
    })

    if (platforms.includes('ios')) configs.push({
        entry: `./src/${name}/index.js`,
        resolve: {
            extensions: ['.ios.js', '.native.js', '.client.js', '.js'],
        },
        output: {
            libraryTarget: 'commonjs2',
            path: path.resolve(__dirname, name),
            filename: 'index.ios.js',
        },
        ...clientConfig
    })

    return configs
}, [])