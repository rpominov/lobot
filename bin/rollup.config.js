import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import {camelCase, pascalCase} from './projectName'

export default {
  entry: 'src/index.js',
  dest: `umd/${camelCase}.js`,
  plugins: [
    nodeResolve({jsnext: true}),
    commonjs(),
    babel(),
  ],
  format: 'umd',
  moduleName: pascalCase,
}
