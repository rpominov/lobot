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

const build = options => {
  const cleanup = `rm -rf lib lib-es umd browser-repl.html`
  const babel = `${b('babel')} src --out-dir`
  const esnext = `BABEL_ENV=rollup ${babel} lib-es`
  const commonjs = `BABEL_ENV=commonjs ${babel} lib`
  const umd = `BABEL_ENV=rollup ${b('rollup')} -c ${path.join(__dirname, 'rollup.config.js')}`
  const umdMin = `${b('uglifyjs')} -m -c -- umd/${projectName.camelCase}.js > umd/${projectName.camelCase}.min.js`

  if (options.mode === 'browser-repl') {
    exec(`${cleanup} && ${umd}`)
    return
  }

  if (options.mode === 'browser-repl-watch') {
    exec(`${b('nodemon')} --watch src --exec "${umd}"`)
    return
  }



  exec(`${cleanup} && ${esnext} && ${commonjs} && ${umd} && ${umdMin}`)
}

const test = options => {
  const baseTestCommand = `BABEL_ENV=commonjs ${b('tape')} -r ${babelRegister} test/*.js`

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
    const base = `BABEL_ENV=commonjs ${nyc} ${b('tape')} test/*.js && ${nyc} report --reporter=text-lcov`
    if (options.mode === 'coverage') {
      exec(`${base} > lcov.info`)
    } else {
      exec(`${base} | ${b('coveralls')}`)
    }
  }
}

const browserRepl = () => {
  build({mode: 'browser-repl'})
  mkdp('./.build-artefacts')
  fs.writeFileSync('./.build-artefacts/repl.html', `
    <script src="../umd/${projectName.camelCase}.js"></script>
    Open browser console
  `)
  exec(`open ./.build-artefacts/repl.html`)
  build({mode: 'browser-repl-watch'})
}

program.version(pkg.version)

program
  .command('init')
  .description('init lobot based project')
  .action(() => {
    console.log('TODO')
  })

program
  .command('build')
  .description('compile to ES5, create UMD bundles, etc.')
  .action(() => { build({}) })

program
  .command('test [mode]')
  .description('run tests. modes: normal|watch|coverage|coveralls default to normal')
  .action(mode => { test({mode}) })

program
  .command('repl [mode]')
  .description('open REPL. modes: node|browser default to node')
  .action(mode => {
    if (!mode || mode === 'node') {
      exec(`BABEL_ENV=commonjs node --require ${babelRegister}`)
      return
    }
    browserRepl()
  })

program
  .command('release')
  .description('publish a new version to NPM')
  .action(() => {
    console.log('TODO')
    // "preversion": "npm run test && npm run build",
    // "postversion": "git push && git push origin --tags && npm publish",
  })

program.parse(process.argv)
