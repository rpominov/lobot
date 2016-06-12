import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'
const projectName = require('./projectName')

export default {
  entry: 'src/index.js',
  dest: `umd/${projectName.camelCase}.js`,
  plugins: [
    nodeResolve({jsnext: true, main: true}),
    json(),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      presets: ['babel-preset-es2015-rollup', 'babel-preset-stage-1', 'babel-preset-react'],
      plugins: ['transform-object-rest-spread'],
      babelrc: false,
    }),
  ],
  format: 'umd',
  moduleName: projectName.pascalCase,
}
