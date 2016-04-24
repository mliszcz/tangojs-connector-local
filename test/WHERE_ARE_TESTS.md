The tests are currently disabled. This requires some more investigation on how
to set-up rollup + mocha + istanbul. Node.js 6.0 can run the tests with mocha,
but cannot handle imports. A test-bundle has to be generated somehow.

Note: rollup-plugin-istanbul handles instrumentation.
