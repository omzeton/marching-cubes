const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: ["./src/index.ts"],
    output: {
        path: path.resolve(__dirname, "/dist"),
        filename: "bundle.js",
        publicPath: "/",
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(woff(2)?|eot|.md|ttf|ico|gif|png|jpg|jpeg|webp|svg|otf)$/i,
                type: "asset",
            },
        ],
    },
    resolve: {
        extensions: ["*", ".js", ".jsx", ".ts", ".tsx", ".md"],
        alias: {
            "@": path.resolve(__dirname, "../src"),
            path: "path-browserify",
            stream: "stream-browserify",
        },
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "../public"),
                    globOptions: {
                        ignore: ["*.DS_Store", "favicon.ico", "template.html"],
                    },
                },
            ],
        }),
        new webpack.ProvidePlugin({
            process: "process/browser",
        }),
    ],
};
