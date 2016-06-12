require("babel-register")({
  presets: ['babel-preset-es2015', 'react'],
  plugins: ['transform-object-rest-spread'],
  babelrc: false,
})
