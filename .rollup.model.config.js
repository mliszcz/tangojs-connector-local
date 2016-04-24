
import coffeescript from 'rollup-plugin-coffee-script'

export default {
  entry: 'src/demo-model.coffee',
  dest: 'lib/demo-model.js',
  format: 'umd',
  moduleName: 'tangojsLocalDemoModel',
  plugins: [
    coffeescript()
  ],
  external: [
    'tangojs-core'
  ],
  globals: {
    'tangojs-core': 'tangojs'
  },
  // , sourceMap: true // sourcemaps are broken by coffeescript plugin
}
