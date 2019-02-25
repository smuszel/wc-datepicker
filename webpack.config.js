const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');

/** @type {webpack.Configuration} */
module.exports = {

    resolve: {
        extensions: ['.js', '.scss']
    },
    module: {
        rules: [
            { test: /\.scss$/, use: ['style-loader', 'css-loader','sass-loader']}
        ]
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new HtmlPlugin({ template: './src/index.html'})
    ],
    devtool: 'source-map'
}