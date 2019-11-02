const path = require('path')
const glob = require('glob')
const webpack = require('webpack')

const entryArray = glob.sync('./src/**/lambda.ts')
const entryObject = entryArray.reduce((acc, item) => {
  const name = path.dirname(item.replace('./src/', ''))
  acc[name] = item
  return acc
}, {})

const config = {
  entry: entryObject,
  devtool: 'source-map',
  target: 'node',
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  optimization: {
    minimize: false,
  },
  resolve: {
    extensions: ['.ts', '.js'],
    symlinks: false,
    cacheWithContext: false
  },
  output: {
    filename: '[name]/lambda.js',
    path: path.resolve(__dirname, 'build'),
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    libraryTarget: 'commonjs2'
  }
}

module.exports = config

