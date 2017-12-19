const alias = require('rollup-plugin-alias');

export default {
  entry: 'src/instance/index.js',
  format: 'iife',
  moduleName: 'Vue',
  dest: 'dist/vue.js', // equivalent to --output
  plugins: [
    alias({
      core: resolve('src/'),
      shared: resolve('src/shared')
    })
  ]
};