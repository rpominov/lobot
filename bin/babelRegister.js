require("babel-register")({
  presets: ['babel-preset-es2015', 'babel-preset-react'],
  plugins: ['transform-object-rest-spread'],
  babelrc: false,
})
