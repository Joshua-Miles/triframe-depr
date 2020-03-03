const fs = require('fs').promises
const exec = require('util').promisify(require('child_process').exec)
const ncp = require('ncp').ncp;
const path = require('path')
const CliProgress = require('cli-progress');
const progress = new CliProgress.Bar({}, CliProgress.Presets.shades_classic);

module.exports = async function newProject(name) {
    console.log('Starting...')
    progress.start(100, 25)
    await exec(`npx expo init "${name}" --template bare-minimum`)
    progress.update(50)
    await exec(`cd "${name}" && npm install nodemon webpack webpack-cli concurrently babel-loader babel-plugin-named-asset-import @expo/webpack-config --save-dev && npm install socket.io express formidable https://github.com/Joshua-Miles/triframe.git`)
    const packagePath = path.join(process.cwd(), name, 'package.json')
    const config = require(packagePath)
    config.scripts = {
        "dev-api": "concurrently \"npx webpack --watch --config api.config.js\"  \"nodemon ./dist/index.js --watch ./dist/index.js\"",
        "dev-web": "expo start --web",
        "dev-android": "react-native run-android",
        "dev-ios": "react-native run-ios"
    }
    await fs.writeFile(packagePath, JSON.stringify(config, null, 2))

    const gitignorePath = path.join(process.cwd(), name, '.gitignore')
    const gitignoreContent = await fs.readFile(gitignorePath)
    await fs.writeFile(gitignorePath, `${gitignoreContent}
dist
.sessions
.uploads`)

    progress.update(75)
    await Promise.all(['api.config.js', 'dist', 'tsconfig.json', 'App.js', 'Api.js', 'views', 'models', 'webpack.config.js'].map(async folder => {
        let source = path.join(__dirname, '__assets__', folder)
        let destination = path.join(process.cwd(), name, folder)
        await new Promise(resolve => ncp(source, destination, resolve))
    }))
    progress.update(100)
    progress.stop()
    console.log('Install Completed')
}