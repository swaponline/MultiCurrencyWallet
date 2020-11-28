module.exports = {
  'presets': [
    ['@babel/preset-env', {
      'targets': {
        'node': 'current',
      },
    }],
    '@babel/preset-typescript',
  ],
  'plugins': [
    [
      'module-resolver',
      {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          root: ['./src'],
          alias: {
            "swap.app": "./src/core/swap.app/index.ts",
            "swap.app/*": "./src/core/swap.app/*",
            "swap.auth": "./src/core/swap.auth/index.ts",
            "swap.auth/*": "./src/core/swap.auth/*",
            "swap.flows": "./src/core/swap.flows/index.ts",
            "swap.flows/*": "./src/core/swap.flows/*",
            "swap.orders": "./src/core/swap.orders/index.ts",
            "swap.orders/*": "./src/core/swap.orders/*",
            "swap.room": "./src/core/swap.room/index.ts",
            "swap.room/*": "./src/core/swap.room/*",
            "swap.swap": "./src/core/swap.swap/index.ts",
            "swap.swap/*": "./src/core/swap.swap/*",
            "swap.swaps": "./src/core/swap.swaps/index.ts",
            "swap.swaps/*": "./src/core/swap.swaps/*",
            "simple.swap.core": "./src/core/simple/src/index.ts"
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
