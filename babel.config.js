module.exports = {
  'presets': [
    '@babel/react',
    '@babel/preset-typescript',
    ['@babel/preset-env', {
      'targets': {
        'browsers': [ '>0.25%', 'not ie 11', 'not op_mini all'],
      },
    }],
  ],
  'plugins': [
    ['@babel/plugin-proposal-decorators', { 'legacy': true }],
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-dynamic-import',
  ],
  sourceType: 'unambiguous'
}
