import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'
const projectName = require('./projectName')

export default {
  entry: 'src/index.js',
  dest: `lib/index.js`,
  plugins: [
    nodeResolve({jsnext: true, main: true}),
    json(),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      presets: ['es2015-rollup', 'stage-1', 'react'],
      plugins: [],
      babelrc: false,
    }),
  ],
  format: 'cjs',
  external: projectName.deps,
}
