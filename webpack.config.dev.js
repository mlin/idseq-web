const merge = require("webpack-merge");
const path = require("path");
const commonConfig = require("./webpack.config.common.js");

module.exports = merge(commonConfig, {
  devtool: "source-map",
  mode: "development",
  output: {
    path: path.resolve(__dirname, "app/assets/dist"),
    filename: "bundle.dev.min.js"
  }
});
