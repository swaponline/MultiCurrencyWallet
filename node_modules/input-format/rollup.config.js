import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'

export default [
  {
    input: 'index.js',
    plugins: [
      json(),
      terser()
    ],
    output: {
      format: 'umd',
      name: 'InputFormat',
      file: 'bundle/input-format.min.js',
      sourcemap: true
    }
  },
  {
    input: 'react/index',
    plugins: [
      json(),
      terser()
    ],
    external: [
      'react',
      'prop-types'
    ],
    output: {
      format: 'umd',
      name: 'InputFormat',
      file: 'bundle/input-format-react.min.js',
      sourcemap: true,
      globals: {
        'react': 'React',
        'prop-types': 'PropTypes'
      }
    }
  }
]