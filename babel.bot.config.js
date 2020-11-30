module.exports = {
  'presets': [
    '@babel/preset-typescript',
    ['@babel/preset-env', {
      'targets': {
        'node': 'current',
      },
    }]
  ],
  'plugins': [
    [
      'module-resolver',
      {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        root: ['./src'],
        alias: {
          "swap.app": "./src/core/swap.app/",
          "swap.app/*": "./src/core/swap.app/*",
          "swap.auth": "./src/core/swap.auth/",
          "swap.auth/*": "./src/core/swap.auth/*",
          "swap.flows": "./src/core/swap.flows/",
          "swap.flows/*": "./src/core/swap.flows/*",
          "swap.orders": "./src/core/swap.orders/",
          "swap.orders/*": "./src/core/swap.orders/*",
          "swap.room": "./src/core/swap.room/",
          "swap.room/*": "./src/core/swap.room/*",
          "swap.swap": "./src/core/swap.swap/",
          "swap.swap/*": "./src/core/swap.swap/*",
          "swap.swaps": "./src/core/swap.swaps/",
          "swap.swaps/*": "./src/core/swap.swaps/*",
          "simple.swap.core": "./src/core/simple/src/",
          "common": "./src/common/",
          "common/*": "./src/common/*"
        },
      },
    ],
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
