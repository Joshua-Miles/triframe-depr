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
  nodeModules['formidable'] = 'commonjs ' + 'formidable';
module.exports = {
  entry: './src/Server.js',
  mode: "development",
  output: {
    path: path.resolve(__dirname),
    filename: 'server.js'
  },
  externals: nodeModules,
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: false,
            presets: ['@babel/preset-env'],
            plugins: [
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