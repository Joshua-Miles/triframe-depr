#!/usr/bin/env node
const program = require('commander')
const fs = require('fs').promises
const exec = require('util').promisify(require('child_process').exec)
const ncp = require('ncp').ncp;
const path = require('path')
const CliProgress = require('cli-progress');
const progress = new CliProgress.Bar({}, CliProgress.Presets.shades_classic);



program
    .command('new <name>')
    .action(async (name) => {
        console.log('Starting...')
        exec('npm ls -g react-native')
            .catch(() => {
                console.log('Instaling React Native...')
                return exec('npm install -g react-native')
            })
            .then(async () => {
                console.log('React Native Installed')
                progress.start(100, 25)
                await exec(`react-native init "${name}"`)
                progress.update(50)
                await fs.unlink(`${name}/App.js`)
                await fs.writeFile(`${name}/package.json`, JSON.stringify(loadPackageConfig(name), null, 2))
                await exec(`cd "${name}" && npm install && npm link triframe`)
                progress.update(75)
                    ;['web', 'src', 'webpack.config.js', 'index.js', 'server.js', '.eslintrc.js', '.gitignore'].forEach(async folder => {
                        let source = path.join(__dirname, '__assets__', folder)
                        let destination = path.join(process.cwd(), name, folder)
                        await new Promise(resolve => ncp(source, destination, resolve))
                    })
                progress.update(100)
                progress.stop()
                console.log('Install Completed')
            })
    })


program
    .command('build type [args...]')
    .action( ([ type, ...args])  => {
        switch(type){
            case 'model':
                let decorators = { _public: true }
                var [ path, name, ...instructions] = args;
                let definition = instructions.reduce( ( definition, part, index ) => {
                    if(part.includes('=')){
                        let [ name, defaults = "" ] = part.split('=')
                        try {
                            JSON.parse(defaults)
                        } catch {
                            defaults = `"${defaults}"`
                        }
                        definition =  `${definition}\n  ${name} = ${defaults}\n`
                    } else {
                        let decorator = part
                        decorators[decorator] = true;
                        definition = ` ${definition}\n  @${decorator}`
                    }
                    return definition
                }, '')
                var code= `import { Model } from 'triframe/librarian'
const { ${Object.keys(decorators).join(', ')} } = Model.Decorators

@_public('find', 'where', 'search', 'create', 'destroyAll', '#commit', '#destroy')
export class ${name} extends Model {
    ${definition}
}`
            
                fs.writeFile(`./src/${path}.js`, code)
            break;
            case 'form':
                    let inputs = {}
                    let defaults = ''
                    var [ path, name, ...instructions] = args;
                    var [ Name, Model = name ] = name.split(':')
                    let fields = instructions.reduce( ( fields, part, index ) => {
                        let [ something, Input = 'TextInput' ] = part.split(':')
                        var [ label, defaultValue = '""' ] = something.split('=')
                        inputs[Input] = true
                        let name = toCamelCase(label)
                        defaults= `${defaults}\n        ${name}: ${defaultValue},`
                        fields = `${fields}
            <${Input}
                label="${label}"
                value={form.${name}}
                onChangeText={${name} => form.set({ ${name} })}
            />
            <HelperText visible={!form.isValid('${name}')} type="error">
                {form.errorsFor('${name}')}
            </HelperText>`
                        return fields
                    }, '')
                    var code= `import React from 'react'
import { tether, Container, Button, HelperText, ${Object.keys(inputs).join(', ')} } from 'triframe/designer'

const ${Name} = tether(function*({  models, props, use, useContext, useHistory, redirect  }) {
    const { ${Model} } = models
    const form = yield use(new ${Model}({${defaults}
    }))
    return (
        <Container>${fields}
            <Button onPress={console.log}>
                Submit
            </Button>
        </Container>
    )
})

export { ${Name} }`
                
                    fs.writeFile(`./src/${path}.js`, code)
                break;
                case 'view':
                    var [ path, Name ] = args;
                    var code= `import React from 'react'
import { tether, Container, Title } from 'triframe/designer'

const ${Name} = tether(function*({  models, props, use, useContext, useHistory, redirect  }) {
    return (
        <Container>
            <Title>${Name}</Title>
        </Container>
    )
})

export { ${Name} }`
                
                    fs.writeFile(`./src/${path}.js`, code)
                break;
        }
    })



const loadPackageConfig = name => ({
    "name": name,
    "version": "0.0.1",
    "private": true,
    "scripts": {
        "dev": "concurrently \".\\node_modules\\.bin\\webpack --watch\" \"node web/scripts/start.js\"  \"nodemon server.js --watch server.js\"",
        "start": "node node_modules/react-native/local-cli/cli.js start",
        "android": "react-native run-android",
        "web": "node scripts/start.js",
        "test": "jest"
    },
    "dependencies": {
        "@babel/core": "7.1.6",
        "@babel/polyfill": "^7.4.4",
        "@babel/preset-flow": "^7.0.0",
        "@svgr/webpack": "2.4.1",
        "babel-core": "7.0.0-bridge.0",
        "babel-eslint": "9.0.0",
        "babel-jest": "23.6.0",
        "babel-loader": "8.0.4",
        "babel-plugin-named-asset-import": "^0.3.0",
        "babel-preset-react-app": "^7.0.0",
        "bfj": "6.1.1",
        "case-sensitive-paths-webpack-plugin": "2.1.2",
        "chalk": "2.4.1",
        "concurrently": "^4.1.1",
        "css-loader": "1.0.0",
        "dotenv": "6.0.0",
        "formidable": "^1.2.1",
        "dotenv-expand": "4.2.0",
        "eslint": "5.6.0",
        "eslint-config-react-app": "^3.0.6",
        "eslint-loader": "2.1.1",
        "eslint-plugin-flowtype": "2.50.1",
        "eslint-plugin-import": "2.14.0",
        "eslint-plugin-jsx-a11y": "6.1.2",
        "eslint-plugin-react": "7.11.1",
        "file-loader": "2.0.0",
        "fork-ts-checker-webpack-plugin-alt": "0.4.14",
        "fs-extra": "7.0.0",
        "html-webpack-plugin": "4.0.0-alpha.2",
        "identity-obj-proxy": "3.0.0",
        "install": "^0.13.0",
        "jest": "23.6.0",
        "jest-pnp-resolver": "1.0.1",
        "jest-resolve": "23.6.0",
        "mini-css-extract-plugin": "0.4.3",
        "npm": "^6.10.2",
        "optimize-css-assets-webpack-plugin": "5.0.1",
        "pnp-webpack-plugin": "1.1.0",
        "postcss-flexbugs-fixes": "4.1.0",
        "postcss-loader": "3.0.0",
        "pg": "^7.12.0",
        "socket.io": "^2.2.0",
        "postcss-preset-env": "6.3.1",
        "postcss-safe-parser": "4.0.1",
        "react": "16.8.3",
        "react-app-polyfill": "^0.2.0",
        "react-art": "^16.8.6",
        "react-dev-utils": "^7.0.1",
        "react-dom": "^16.8.6",
        "react-native": "0.59.9",
        "react-native-paper": "^2.16.0",
        "react-native-side-menu": "^1.1.3",
        "react-native-vector-icons": "^6.5.0",
        "react-native-web": "^0.11.5",
        "react-router-dom": "^5.0.1",
        "react-router-native": "^5.0.1",
        "resolve": "1.8.1",
        "sass-loader": "7.1.0",
        "style-loader": "0.23.0",
        "terser-webpack-plugin": "1.1.0",
        "url-loader": "1.1.1",
        "webpack": "4.19.1",
        "webpack-dev-server": "3.1.14",
        "webpack-manifest-plugin": "2.0.4",
        "workbox-webpack-plugin": "3.6.3"
    },
    "devDependencies": {
        "@babel/core": "7.4.5",
        "@babel/runtime": "7.4.5",
        "babel-jest": "24.8.0",
        "jest": "24.8.0",
        "metro-react-native-babel-preset": "0.54.1",
        "react-test-renderer": "16.8.3",
        "webpack-cli": "^3.3.5"
    },
    "jest": {
        "collectCoverageFrom": [
            "src/**/*.{js,jsx,ts,tsx}",
            "!src/**/*.d.ts"
        ],
        "resolver": "jest-pnp-resolver",
        "setupFiles": [
            "react-app-polyfill/jsdom"
        ],
        "testMatch": [
            "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
            "<rootDir>/src/**/?(*.)(spec|test).{js,jsx,ts,tsx}"
        ],
        "testEnvironment": "jsdom",
        "testURL": "http://localhost",
        "transform": {
            "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest",
            "^.+\\.css$": "<rootDir>/config/jest/cssTransform.js",
            "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "<rootDir>/config/jest/fileTransform.js"
        },
        "transformIgnorePatterns": [
            "[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$",
            "^.+\\.module\\.(css|sass|scss)$"
        ],
        "moduleNameMapper": {
            "^react-native$": "react-native-web",
            "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy"
        },
        "moduleFileExtensions": [
            "web.js",
            "js",
            "web.ts",
            "ts",
            "web.tsx",
            "tsx",
            "json",
            "web.jsx",
            "jsx",
            "node"
        ]
    },
    "babel": {
        "presets": [
            "react-app"
        ],
        "plugins": [
            "@babel/plugin-proposal-class-properties"
        ]
    },
    "eslintConfig": {
        "extends": "react-app"
    },
    "browserslist": [
        ">0.2%",
        "not dead",
        "not ie <= 11",
        "not op_mini all"
    ]
})

process.on('SIGINT', function () {
    process.exit(1);
});

program.parse(process.argv)


function toCamelCase(str, upper) {
	str = str.toLowerCase();
	var parts = str.split(/[\s_]+/g);
	for (var i = upper === true ? 0 : 1, ii = parts.length; i < ii; ++i) {
		var part = parts[i];
		parts[i] = part.charAt(0).toUpperCase() + part.substr(1);
	}
	return parts.join('');
};
