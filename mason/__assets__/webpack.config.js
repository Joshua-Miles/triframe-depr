// const merge = require('webpack-merge');
// This will automatically get the dev/prod config based on process.env.NODE_ENV.
const expoConfig = require('@expo/webpack-config');


module.exports = async function (env, argv) {
    let config = await expoConfig(env, argv)
    let original = config.module.rules[1].oneOf[2].include
    config.module.rules[1].oneOf[2].include = path => original(path) || path.includes('triframe')
    return config
};