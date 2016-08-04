import path from 'path'
import config from './rollup.config.cjs.js'
const projectName = require('./projectName')

config.dest = `umd/${projectName.camelCase}.js`
config.format = 'umd'
config.external = []
config.moduleName = projectName.pascalCase

export default config
