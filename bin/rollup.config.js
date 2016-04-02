import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'

// import {camelCase, pascalCase} from './projectName'
// see https://github.com/rollup/rollup/issues/578
const path = require('path')
const changeCase = require('change-case')
const name = require(path.resolve('./package.json')).name
const camelCase = changeCase.camelCase(name)
const pascalCase = changeCase.pascalCase(name)

export default {
  entry: 'src/index.js',
  dest: `umd/${camelCase}.js`,
  plugins: [
    nodeResolve({jsnext: true, main: true}),
    json(),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      presets: ['babel-preset-es2015-rollup'],
      plugins: ['transform-object-rest-spread'],
      babelrc: false,
    }),
  ],
  format: 'umd',
  moduleName: pascalCase,
}
