const path = require('path')
const changeCase = require('change-case')
const pkg = require(path.resolve('./package.json'))

exports.name = pkg.name
exports.camelCase = changeCase.camelCase(pkg.name)
exports.pascalCase = changeCase.pascalCase(pkg.name)

exports.deps = Object.keys(pkg.dependencies || {})
  .concat(Object.keys(pkg.devDependencies || {}))
  .concat(Object.keys(pkg.peerDependencies || {}))
