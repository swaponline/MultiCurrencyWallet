module.exports = {
  'presets': [
    ['@babel/preset-env', {
      'targets': {
        'node': 'current',
      },
    }],
  ],
  'plugins': [
    'add-module-exports',
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
