var webpack = require("webpack");
const pkg = require("./package.json");
const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        app: "./src/app.tsx",
        "examples/fake-sensor": "./src/examples/fake-sensor.tsx",
        "examples/sensor-tag": "./src/examples/sensor-tag.tsx",
        "examples/thermoscope": "./src/examples/thermoscope.tsx",
        "examples/wired-wireless": "./src/examples/wired-wireless.tsx",
        "examples/sensor-connector": "./src/examples/sensor-connector.tsx",
        interactive: "./src/interactive/index.tsx",
        "report-item": "./src/interactive/report-item.tsx"
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist")
    },
    performance: {
        hints: false
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",
    devServer: {
        static: {
            directory: path.join(__dirname, 'src/public'),
            serveIndex: true,
        }
    },
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: "ts-loader",
            exclude: /node_modules/,
        }]
    },
    plugins: [
        new CopyPlugin({
          patterns: [{
            from: "**/*",
            context: path.resolve(__dirname, "src", "public")
            }]
        }),
      ],
};
