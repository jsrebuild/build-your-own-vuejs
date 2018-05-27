const alias = require('rollup-plugin-alias');
const path = require('path')
const resolve = p => path.resolve(__dirname, './', p)

module.exports = function(config) {
  config.set({
    files: [{ pattern: 'test/**/*.spec.js', watched: false }],
    frameworks: ['jasmine'],

    browsers: ['Chrome'],
    preprocessors: {
      './test/**/*.js': ['rollup']
    },
    rollupPreprocessor: {
      plugins: [
        require('rollup-plugin-buble')(),
        alias({
          core: resolve('src/'),
          src: resolve('src/'),
          shared: resolve('src/shared')
        })
      ],
      output: {
        format: 'iife',
        name: 'Vue',
        sourcemap: 'inline'
      }
    }
  })
}