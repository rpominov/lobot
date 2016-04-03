import path from 'path'
import config from './rollup.config.js'
const projectName = require('./projectName')

config.dest = 'es-lib/index.js'
config.format = 'es6'
config.external = projectName.deps

export default config
