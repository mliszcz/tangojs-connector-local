
export default {
  entry: 'src/tangojs-connector-local.js',
  dest: 'lib/tangojs-connector-local.js',
  format: 'umd',
  moduleId: 'tangojs-connector-local',
  moduleName: 'tangojs.connector.local',
  plugins: [],
  external: [
    'tangojs-core'
  ],
  globals: {
    'tangojs-core': 'tangojs.core'
  },
  sourceMap: true
}
