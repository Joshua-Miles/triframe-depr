const program = require('commander')

const newProject = require('./new')
const build = require('./build')

program
    .command('new <name>')
    .action(newProject)
    

program
    .command('build type [args...]')
    .action( build)

program.parse(process.argv)