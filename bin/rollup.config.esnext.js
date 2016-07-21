import path from 'path'
import config from './rollup.config.js'
const projectName = require('./projectName')

config.dest = 'lib-es/index.js'
config.format = 'es'
config.external = projectName.deps

export default config
