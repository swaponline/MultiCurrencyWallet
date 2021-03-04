module.exports = {
  parallel: true,
  shuffle: true,
  leaks: false,
  verbose: true,
  sourcemaps: true,
  reporter: 'console',
  'coverage-path': './src',
  transform: './test/transform.js',
  paths: [
    'test'
  ]
};
