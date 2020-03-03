const path = require('path');
var fs = require('fs');
var nodeModules = {};

fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

  nodeModules['fs'] = 'commonjs ' + 'fs';
  nodeModules['http'] = 'commonjs ' + 'http';
  nodeModules['util'] = 'commonjs ' + 'util';
  nodeModules['child_process'] = 'commonjs ' + 'child_process';
  nodeModules['net'] = 'commonjs ' + 'net';
  nodeModules['dns'] = 'commonjs ' + 'dns';
  nodeModules['formidable'] = 'commonjs ' + 'formidable';
  nodeModules['pg-native'] = 'commonjs ' + 'pg-native';
  nodeModules['tls'] = 'commonjs ' + 'tls';
  nodeModules['socket.io'] = 'commonjs ' + 'socket.io';
  nodeModules['express'] = 'commonjs ' + 'express';
  
module.exports = {
  entry: './Api.js',
  mode: "development",
  output: {
    path: path.resolve(path.join(__dirname, 'dist')),
    filename: 'index.js'
  },
  node: {
    process: false
  },
  externals: nodeModules,
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: path => {
          let result = (path.includes('node_modules') || path.includes('bower_components')) &&! path.includes('triframe')
          return result
        },
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
};