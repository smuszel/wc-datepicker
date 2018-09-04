const path = require('path');

const pathTo = {
    dist: path.resolve('dist'),
    entry: path.resolve('src', 'main.ts'),
}

module.exports = {
    entry: pathTo.entry,
    output: {
        path: pathTo.dist,
        filename: 'main.js'
    },
    resolve: {
        extensions: ['.ts', '.scss', '.js']
    },
    module: {
        rules: [
            { test: /\.ts$/, use: 'ts-loader'},
            { test: /\.scss$/, use: ['style-loader', 'css-loader','sass-loader']}
        ]
    },
    mode: 'development',
    devtool: 'eval'
}