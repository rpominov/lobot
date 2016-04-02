const path = require('path')
const changeCase = require('change-case')
const name = require(path.resolve('./package.json')).name

exports.name = name
exports.camelCase = changeCase.camelCase(name)
exports.pascalCase = changeCase.pascalCase(name)
