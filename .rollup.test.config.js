
import multientry from 'rollup-plugin-multi-entry'
import istanbul from 'rollup-plugin-istanbul'

export default {
  entry: 'test/unit/**/*.test.js',
  dest: 'build/unit.bundle.test.js',
  format: 'cjs',
  plugins: [
    multientry(),
    istanbul({
      include: ['src/**/*.js']
    })
  ],
  external: [
    'chai',
    'chai-as-promised',
    'sinon',
    'sinon-chai',
    'tangojs-core'
  ],
  sourceMap: 'inline'
}
