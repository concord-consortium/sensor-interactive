var webpack = require("webpack");
const pkg = require("./package.json");

module.exports = {
    entry: {
        app: "./src/app.tsx",
        "examples/fake-sensor": "./src/examples/fake-sensor.tsx",
        "examples/sensor-tag": "./src/examples/sensor-tag.tsx",
        "examples/thermoscope": "./src/examples/thermoscope.tsx",
        "examples/wired-wireless": "./src/examples/wired-wireless.tsx",
        "examples/sensor-connector": "./src/examples/sensor-connector.tsx",
        globals: Object.keys(pkg.dependencies)
    },
    output: {
        filename: "[name].js",
        path: __dirname + "/dist/assets/js"
    },
    performance: {
        hints: false
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    }
};
