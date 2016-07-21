#!/usr/bin/env node

const program = require('commander')
const pkg = require('../package.json')
const execSync = require('child_process').execSync
const path = require('path')
const projectName = require('./projectName')
const fs = require('fs')


const exec = command => {
  execSync(command, {stdio: 'inherit'})
}

const mkdp = dirPath => {
  exec(`mkdir -p ${path.resolve(dirPath)}`)
}

const b = filename => `\`npm bin\`/${filename}`

const babelRegister = path.resolve(path.join(__dirname, 'babelRegister.js'))

const cleanup = options => {
  if (options.mode === 'soft') {
    return 'rm -rf lib lib-es umd'
  }
  if (options.mode === 'hard') {
    return 'rm -rf lib lib-es umd .build-artefacts .nyc_output'
  }

  return options.mode === 'so'
}

const build = options => {
  const commonjs = `${b('babel')} --no-babelrc --presets es2015,stage-1,react --plugins transform-object-rest-spread src --out-dir lib`
  const esnext = `${b('rollup')} -c ${path.join(__dirname, 'rollup.config.esnext.js')}`
  const umd = `${b('rollup')} -c ${path.join(__dirname, 'rollup.config.js')}`
  const umdMin = `${b('uglifyjs')} -m -c -- umd/${projectName.camelCase}.js > umd/${projectName.camelCase}.min.js`

  if (options.mode === 'browser-repl') {
    return `${cleanup({mode:'soft'})} && ${umd}`
  }

  if (options.mode === 'browser-repl-watch') {
    return `${b('nodemon')} --watch src --exec "${umd}"`
  }

  return `${cleanup({mode:'soft'})} && ${esnext} && ${commonjs} && ${umd} && ${umdMin}`
}

const test = options => {
  const baseTestCommand = `${b('tape')} -r ${babelRegister} test/*.js`

  if (!options.mode || options.mode === 'normal') {
    exec(`${baseTestCommand} | ${b('faucet')}`)
    return
  }

  if (options.mode === 'watch') {
    const testCommand = `${baseTestCommand} | ${b('tap-notify')} | ${b('faucet')}`
    exec(`${b('nodemon')} --watch test --watch src --exec "${testCommand}"`)
    return
  }

  if (options.mode === 'coverage' || options.mode === 'coveralls') {
    const nyc = `${b('nyc')} --include **/src/** --all --require ${babelRegister}`
    const base = `${nyc} ${b('tape')} test/*.js && ${nyc} report --reporter=text-lcov`
    if (options.mode === 'coverage') {
      exec(`${base} > .build-artefacts/lcov.info`)
    } else {
      exec(`${base} | ${b('coveralls')}`)
    }
  }
}

const browserRepl = () => {
  exec(build({mode: 'browser-repl'}))
  mkdp('./.build-artefacts')
  fs.writeFileSync('./.build-artefacts/repl.html', `
    <script src="../umd/${projectName.camelCase}.js"></script>
    Open browser console
  `)
  exec(`open ./.build-artefacts/repl.html`)
  exec(build({mode: 'browser-repl-watch'}))
}

program.version(pkg.version)

program
  .command('init')
  .description('init lobot based project')
  .action(() => {
    exec('npm i -D eslint babel-eslint')

    const pkg = require(path.resolve('./package.json'))
    pkg.main = 'lib/index.js'
    pkg['jsnext:main'] = 'lib-es/index.js'
    pkg.files = ['lib', 'lib-es', 'umd']
    pkg.scripts = {
      lobot: 'lobot',
      lint: 'eslint .',
      test: 'eslint . && lobot test',
    }
    fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2))

    fs.writeFileSync('./.eslintignore',
`lib
lib-es
umd
.build-artefacts
`)

    fs.writeFileSync('./.eslintrc',
`{
  "parser": "babel-eslint",
  "extends": ["eslint:recommended"],
  "rules": {
    "comma-dangle": [2, 'always-multiline']
  },
  "env": {
    "node": true
  }
}
`)

    fs.writeFileSync('./.gitignore',
`node_modules
lib
lib-es
umd
npm-debug.log
.nyc_output
.build-artefacts
`)

    fs.writeFileSync('./.npmignore',
`npm-debug.log
.nyc_output
.build-artefacts
`)

    fs.writeFileSync('./.travis.yml',
`language: node_js
sudo: false
node_js:
- '5.10'
cache:
  directories:
    - node_modules
script:
  - npm run lint && npm run lobot -- test coveralls
`)

    fs.writeFileSync('./coverageconfig.json',
`{
  "coverage": ["./.build-artefacts/lcov.info"]
}
`)

    const readme = fs.readFileSync('./README.md', 'utf8')
    fs.writeFileSync('./README.md',
`${readme}

## Development

\`\`\`
npm run lobot -- --help
\`\`\`

Run [lobot](https://github.com/rpominov/lobot) commands as \`npm run lobot -- args...\`
`)

  })

program
  .command('cleanup [mode]')
  .description('remove build files, if mode=hard also removes all build artefacts')
  .action(mode => { exec(cleanup({mode})) })

program
  .command('build')
  .description('compile to ES5, create UMD bundles, etc.')
  .action(() => { exec(build({})) })

program
  .command('test [mode]')
  .description('run tests. modes: normal|watch|coverage|coveralls default to normal')
  .action(mode => { test({mode}) })

program
  .command('repl [mode]')
  .description('open REPL. modes: node|browser default to node')
  .action(mode => {
    if (!mode || mode === 'node') {
      exec(`node --require ${babelRegister}`)
      return
    }
    browserRepl()
  })

program
  .command('run [path]')
  .description('runs js program from given path with babel compilation')
  .action(path => {
    exec(`node --require ${babelRegister} ${path}`)
  })

program
  .command('release <version>')
  .description('publish a new version to NPM')
  .action(version => {
    const pre = `npm test && ${build({})}`
    const post = 'git push && git push origin --tags && npm publish'
    exec(`${pre} && npm version ${version} && ${post}`)
  })

program.parse(process.argv)
