import path from 'path'
import config from './rollup.config.cjs.js'

config.dest = 'lib-es/index.js'
config.format = 'es'

export default config
