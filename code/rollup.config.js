const alias = require('rollup-plugin-alias');
const path = require('path')
const resolve = p => path.resolve(__dirname, './', p)

export default {
    input: 'src/instance/index.js',
    output: {
      name: 'Vue',
      file: 'dist/vue.js',
      format: 'iife'
    },
    plugins: [
      alias({
        core: resolve('src/'),
        shared: resolve('src/shared')
      })
    ] 
  };