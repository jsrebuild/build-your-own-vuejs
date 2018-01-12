const alias = require('rollup-plugin-alias');
const path = require('path')
const resolve = p => path.resolve(__dirname, './', p)

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      './test/**/*.js'
    ],
    browsers: ['Chrome'],
    preprocessors: {
      './test/**/*.js': ['rollup']
    },
    rollupPreprocessor: {
      plugins: [alias({
        core: resolve('src/'),
        shared: resolve('src/shared')
      })],
      // will help to prevent conflicts between different tests entries 
      format: 'iife',
      sourceMap: 'inline'
    }
  })
}