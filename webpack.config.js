var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');

module.exports = {
    context: __dirname,
    devtool: debug ? "inline-sourcemap" : null,
    entry: "./public/js/main.js",
    output: {
        path: __dirname + "/public/dist/js",
        filename: "bundle.js"
    },
    plugins: debug ? [] : [
        new webpack.optimize.DedupePlugin()
    ]
};