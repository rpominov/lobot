#!/usr/bin/env node

const program = require('commander')
const pkg = require('../package.json')
const execSync = require('child_process').execSync
const path = require('path')
const projectName = require('./projectName')


const exec = command => {
  execSync(command, {stdio: 'inherit'})
}

const b = filename => `\`npm bin\`/${filename}`

const baseTestCommand = `BABEL_ENV=commonjs ${b('tape')} -r babel-register test/*.js`
const nyc = `${b('nyc')} --include **/src/** --all --require babel-register`
const baseCoverageCommand = `BABEL_ENV=commonjs ${nyc} ${b('tape')} test/*.js && ${nyc} report --reporter=text-lcov`

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
  .action(() => {
    const cleanup = `rm -rf lib lib-es umd`
    const babel = `${b('babel')} src --out-dir`
    const esnext = `BABEL_ENV=rollup ${babel} lib-es`
    const commonjs = `BABEL_ENV=commonjs ${babel} lib`
    const umd = `BABEL_ENV=rollup ${b('rollup')} -c ${path.join(__dirname, 'rollup.config.js')}`
    const umdMin = `${b('uglifyjs')} -m -c -- umd/${projectName.camelCase}.js > umd/${projectName.camelCase}.min.js`
    exec(`${cleanup} && ${esnext} && ${commonjs} && ${umd} && ${umdMin}`)
  })

program
  .command('test')
  .description('run tests')
  .action(() => {
    exec(`${baseTestCommand} | ${b('faucet')}`)
  })

program
  .command('watch-test')
  .description('run tests in watch mode')
  .action(() => {
    const testCommand = `${baseTestCommand} | ${b('tap-notify')} | ${b('faucet')}`
    exec(`${b('nodemon')} --watch test --watch src --exec "${testCommand}"`)
  })

program
  .command('coverage')
  .description('save coverage information to local file')
  .action(() => {
    exec(`${baseCoverageCommand} > lcov.info`)
  })

program
  .command('coveralls')
  .description('send coverage information to coveralls')
  .action(() => {
    exec(`${baseCoverageCommand} | ${b('coveralls')}`)
  })

program
  .command('repl')
  .description('open REPL')
  .action(() => {
    exec(`BABEL_ENV=commonjs node --require babel-register`)
  })

program
  .command('browser-repl')
  .description('open a browser with UMD bundle loaded')
  .action(() => {
    console.log('TODO')
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
