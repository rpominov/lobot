const path = require('path')
const changeCase = require('change-case')
const name = require(path.resolve('./package.json')).name

module.exports = {
  name: name,
  camelCase: changeCase.camelCase(name),
  pascalCase: changeCase.pascalCase(name),
}


