module.exports = function(config) {
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
      // will help to prevent conflicts between different tests entries 
      format: 'iife',
      sourceMap: 'inline'
    }
  })
}