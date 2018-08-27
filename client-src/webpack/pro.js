const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const QiniuPlugin = require('qiniu-webpack-plugin')
const baseConfig = require('./base')
const qntoken = {
  // 如果使用七牛的童鞋，可以自行输入token之类的参数体验
  accessKey: '',
  secretKey: '',
  bucket: '',
  cdnBase: '',
}

const cdnPath = '/XXX'

module.exports = merge(baseConfig, {
  output: {
    filename: 'bundle-[hash].js',
    publicPath: `${qntoken.cdnBase}/${cdnPath}`,
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.(gif|png|jpe?g|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]-[hash].[ext]',
              publicPath: `${qntoken.cdnBase}/${cdnPath}`,
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              optipng: {
                optimizationLevel: 7,
              },
              gifsicle: {
                interlaced: false,
              },
              pngquant: {
                quality: '65-90',
                speed: 4,
              },
              mozjpeg: {
                progressive: true,
                quality: 65,
              },
              svgo: {
                plugins: [
                  { removeViewBox: false },
                  { removeEmptyAttrs: false },
                ],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../index.ejs'),
      filename: path.resolve(__dirname, '../../views/index.ejs'),
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        beautify: false,
        comments: false,
        compress: {
          warnings: false,
          drop_console: true,
          collapse_vars: true,
          reduce_vars: true,
        },
      },
    }),
    new QiniuPlugin({
      ACCESS_KEY: qntoken.accessKey,
      SECRET_KEY: qntoken.secretKey,
      bucket: qntoken.bucket,
      path: cdnPath,
      // 支持上传的文件
      include: [
        /\.js$/,
        /\.css$/,
        /\.(gif|png|jpe?g|svg)$/,
      ],
    }),
  ],
})