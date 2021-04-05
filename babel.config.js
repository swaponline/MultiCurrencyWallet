module.exports = {
  'presets': [
    ['@babel/preset-env', {
      'targets': {
        'browsers': [ '>0.25%', 'not ie 11', 'not op_mini all' ],
      },
    }],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  'plugins': [
    ['@babel/plugin-proposal-decorators', { 'legacy': true }],
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-export-default-from',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-transform-destructuring',
  ],
  sourceType: 'unambiguous'
}
