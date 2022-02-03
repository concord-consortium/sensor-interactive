var webpack = require("webpack");
const pkg = require("./package.json");
const path = require('path');
module.exports = {
    entry: {
        app: "./src/app.tsx",
        "examples/fake-sensor": "./src/examples/fake-sensor.tsx",
        "examples/sensor-tag": "./src/examples/sensor-tag.tsx",
        "examples/thermoscope": "./src/examples/thermoscope.tsx",
        "examples/wired-wireless": "./src/examples/wired-wireless.tsx",
        "examples/sensor-connector": "./src/examples/sensor-connector.tsx",
        interactive: "./src/interactive/index.tsx",
        "report-item": "./src/interactive/report-item.tsx",
        globals: Object.keys(pkg.dependencies)
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname,"dist/assets/js")
    },
    performance: {
        hints: false
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",
    devServer: {
        static: 'dist',
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
    }
};
