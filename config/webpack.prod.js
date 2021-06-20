const webpack = require("webpack");
const { merge } = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const commonConfig = require("./webpack.common.js");

module.exports = merge(commonConfig, {
    mode: "production",
    target: "browserslist",
    devtool: false,
    module: {
        rules: [
            // Styles
            {
                test: /\.(s[ac]|c)ss$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader", "sass-loader"],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "styles/[name].[contenthash].css",
            chunkFilename: "styles/[name].[id].[contenthash].css",
            ignoreOrder: false,
        }),
        new HtmlWebpackPlugin({
            template: "./public/template.html",
            favicon: "./public/favicon.ico",
            hash: true,
        }),
        new webpack.SourceMapDevToolPlugin({
            exclude: ["/node_modules/"],
        }),
    ],
    performance: {
        hints: "warning",
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    },
    optimization: {
        minimizer: [new CssMinimizerPlugin(), "..."],
        runtimeChunk: "multiple",
    },
});
