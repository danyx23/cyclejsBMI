/**
 * Created by danyx on 30.03.15.
 */
module.exports = {
    entry: "./js/cyclebmi.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    },
    devtool: "sourcemap"
};