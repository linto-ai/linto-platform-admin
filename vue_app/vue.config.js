const path = require('path')

module.exports = {
  configureWebpack: config => {
    config.devtool = false
  },
  outputDir: path.resolve(__dirname, '../webserver/dist'),
  publicPath: path.resolve(__dirname, '/assets'),
  pages: {
    login: {
      entry: 'src/login.js',
      template: 'public/default.html',
      filename: 'login.html',
      title: 'LOGIN'
    },
    admin: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      title: 'ADMIN'
    }
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [path.resolve(__dirname, './public/styles/sass/styles.scss')]
    }
  }
}
