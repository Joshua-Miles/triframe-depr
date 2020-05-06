const path = require('path');
const fs = require('fs');
const nodeModules = {};

fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

  const externals = [
    nodeModules,
    [
        'readline', 
        'fs', 
        'child_process', 
        'http', 
        'https',
        'triframe/core',
        'triframe/scribe',
        'triframe/arbiter',
        'triframe/designer',
        'triframe/mason',
        'net',
        'tls',
        'crypto',
        'zlib',
        'stream',
        'events',
        'buffer',
        'path',
        'bufferutil',
        'utf-8-validate',
        'url'
    ].reduce( (externals, package) => ({ ...externals, [package]: `commonjs ${package}`}), {})
]

const serverConfig = {
    mode: 'development',
    externals,
    node: {
        process: false,
        __dirname: false,
        Buffer: false
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
    // mode: 'development',
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