module.exports = {
  input: './src/br-encoded-hierarchy-paragraph.js',
  output: [{
    file: 'dist/index.js',
    format: 'cjs',
    sourcemap: true
  }, {
    file: 'dist/index.es.js',
    format: 'es',
    sourcemap: true
  }],
  plugins: [require('@rollup/plugin-buble')()],
  external(id) { return !/^[\.\/]/.test(id) }
}
