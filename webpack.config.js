var webpack = require("webpack");
const pkg = require("./package.json");
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

// DEPLOY_PATH is set by the s3-deploy-action its value will be:
// `branch/[branch-name]/` or `version/[tag-name]/`
// See the following documentation for more detail:
//   https://github.com/concord-consortium/s3-deploy-action/blob/main/README.md#top-branch-example
const DEPLOY_PATH = process.env.DEPLOY_PATH;

module.exports = {
    entry: {
        app: "./src/app.tsx",
        "examples/fake-sensor-bar-prediction-prerecorded": "./src/examples/fake-sensor-bar-prediction-prerecorded.tsx",
        "examples/fake-sensor-bar-prediction": "./src/examples/fake-sensor-bar-prediction.tsx",
        "examples/fake-sensor-bar-prerecorded": "./src/examples/fake-sensor-bar-prerecorded.tsx",
        "examples/fake-sensor-bar-prerecorded-ondemand": "./src/examples/fake-sensor-bar-prerecorded-ondemand.tsx",
        "examples/fake-sensor-bar": "./src/examples/fake-sensor-bar.tsx",
        "examples/fake-sensor-line-prediction-prerecorded": "./src/examples/fake-sensor-line-prediction-prerecorded.tsx",
        "examples/fake-sensor-line-prediction": "./src/examples/fake-sensor-line-prediction.tsx",
        "examples/fake-sensor-line-prerecorded": "./src/examples/fake-sensor-line-prerecorded.tsx",
        "examples/fake-sensor-line-prerecorded-ondemand": "./src/examples/fake-sensor-line-prerecorded-ondemand.tsx",
        "examples/fake-sensor-line": "./src/examples/fake-sensor-line.tsx",
        "examples/fake-sensor-prompt-pause-ondemand": "./src/examples/fake-sensor-prompt-pause-ondemand.tsx",
        "examples/fake-sensor": "./src/examples/fake-sensor.tsx",
        "examples/sensor-connector": "./src/examples/sensor-connector.tsx",
        "examples/sensor-tag": "./src/examples/sensor-tag.tsx",
        "examples/thermoscope": "./src/examples/thermoscope.tsx",
        "examples/wired-wireless": "./src/examples/wired-wireless.tsx",
        "examples/fake-sensor-bar-preload-temperature": "./src/examples/fake-sensor-bar-preload-temperature.tsx",
        "examples/fake-sensor-bar-preload-position": "./src/examples/fake-sensor-bar-preload-position.tsx",
        "examples/fake-sensor-bar-preload-temperature-pause-ondemand": "./src/examples/fake-sensor-bar-preload-temperature-pause-ondemand.tsx",
        "examples/fake-sensor-bar-preload-position-pause-ondemand": "./src/examples/fake-sensor-bar-preload-position-pause-ondemand.tsx",
        "examples/fake-sensor-bar-preload-predict-temperature": "./src/examples/fake-sensor-bar-preload-predict-temperature.tsx",
        "examples/fake-sensor-bar-preload-predict-position": "./src/examples/fake-sensor-bar-preload-predict-position.tsx",
        "examples/fake-sensor-bar-preload-predict-temperature-pause-ondemand": "./src/examples/fake-sensor-bar-preload-predict-temperature-pause-ondemand.tsx",
        "examples/fake-sensor-bar-preload-predict-position-pause-ondemand": "./src/examples/fake-sensor-bar-preload-predict-position-pause-ondemand.tsx",
        "examples/fake-sensor-line-preload-temperature": "./src/examples/fake-sensor-line-preload-temperature.tsx",
        "examples/fake-sensor-line-preload-position": "./src/examples/fake-sensor-line-preload-position.tsx",
        "examples/fake-sensor-line-preload-temperature-pause-ondemand": "./src/examples/fake-sensor-line-preload-temperature-pause-ondemand.tsx",
        "examples/fake-sensor-line-preload-position-pause-ondemand": "./src/examples/fake-sensor-line-preload-position-pause-ondemand.tsx",
        "examples/fake-sensor-line-preload-predict-temperature": "./src/examples/fake-sensor-line-preload-predict-temperature.tsx",
        "examples/fake-sensor-line-preload-predict-position": "./src/examples/fake-sensor-line-preload-predict-position.tsx",
        "examples/fake-sensor-line-preload-predict-temperature-pause-ondemand": "./src/examples/fake-sensor-line-preload-predict-temperature-pause-ondemand.tsx",
        "examples/fake-sensor-line-preload-predict-position-pause-ondemand": "./src/examples/fake-sensor-line-preload-predict-position-pause-ondemand.tsx",
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
    devtool: "eval-cheap-source-map",
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
        },
        {
            test: /\.css$/i,
            use: [
                "style-loader",
                {
                    loader: "css-loader",
                    options: {
                        modules: {
                            mode: 'icss'
                        }
                    }
                },
                "postcss-loader"
            ],
          },
        ]
    },
    plugins: [
        new CopyPlugin({
          patterns: [{
            from: "**/*",
            context: path.resolve(__dirname, "src", "public")
          }],
        }),
        new HtmlWebpackPlugin({
          chunks: ["app"],
          filename: 'index.html',
          template: 'src/index.html',
          favicon: 'src/public/favicon.ico',
          publicPath: '.',
        }),
        ...(DEPLOY_PATH ? [new HtmlWebpackPlugin({
          chunks: ["app"],
          filename: 'index-top.html',
          template: 'src/index.html',
          favicon: 'src/public/favicon.ico',
          publicPath: DEPLOY_PATH
        })] : []),
      ],
};
