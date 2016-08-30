"use strict"

const tapeCatch = require('tape-catch')

const enhanceT = t => {
  return Object.assign({}, t, {

    calledWith() {
      const xs = Array.prototype.slice.call(arguments)
      return function(x) {
        if (arguments.length > 1) {
          t.fail('called with more than one arg')
        }
        t.deepEqual(x, xs.shift())
      }
    },

    calledOnce() {
      let haveBeenCalled = false
      return () => {
        t.ok(!haveBeenCalled, 'called more than once')
        haveBeenCalled = true
      }
    },

  })
}

const addPrefix = (prefix, text) => {
  return prefix
    ? `${prefix}. ${text}`
    : text
}

const wrap = (prefix, cb) => {
  const test = (text, plan, cb) => {
    tapeCatch(addPrefix(prefix, text), t => {
      t.plan(plan)
      cb(enhanceT(t))
      t.end()
    })
  }
  test.async = (text, plan, cb) => {
    tapeCatch(addPrefix(prefix, text), t => {
      t.plan(plan)
      cb(enhanceT(t))
    })
  }
  test.wrap = (_prefix, cb) => wrap(addPrefix(prefix, _prefix), cb)
  if (cb) {
    cb(test)
  }
  return test
}

module.exports = wrap('')
