import newProject from './new'
import build from './build'
import deploy from './deploy'

const program = require('commander')

program
    .command('deploy <name>')
    .action( deploy )

program
    .command('new <name>')
    .action(newProject)
    

program
    .command('build type [args...]')
    .action( build)

program.parse(process.argv)