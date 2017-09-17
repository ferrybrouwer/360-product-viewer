const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const production = process.env.NODE_ENV === "production";

module.exports = {
  target: "web",

  context: path.join(__dirname, "src"),

  entry: {
    'product-viewer': path.join(__dirname, "src/product-viewer.js")
  },

  output: {
    filename: "[name].js",
    path: path.join(__dirname, "dist"),
    publicPath: ""
  },

  module: {
    rules: [
      // JavaScript
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader"
      },

      // Sass
      {
        test: /\.scss$/,
        include: path.join(__dirname, "src/scss"),
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            {
              loader: "css-loader",
              options: {
                modules: true,
                localIdentName: "[name]__[local]__[hash:base64:5]",
                importLoaders: 1,
                sourceMap: !production
              }
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: !production
              }
            }
          ]
        })
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: "Product Viewer",
      inject: false,
      inline: `<script>
        // create instance
        var productViewer = new ProductViewer({
          element: document.getElementById('product_viewer'),
          imagePath: './images',
          filePrefix: 'img',
          fileExtension: '.jpg'
        });

        // once loaded, give it a 360 spin
        productViewer.once('loaded', function() {
          productViewer.animate360();
        });
      </script>`,
      template: path.join(__dirname, "src/index.ejs")
    }),
    new ExtractTextPlugin({
      filename: "[name].css",
      allChunks: true,
      disable: !production
    })
  ],

  resolve: {
    extensions: [".js"],
    modules: [path.join(__dirname, "src"), "node_modules"]
  },

  devServer: {
    host: '0.0.0.0',
    port: 8080,
    disableHostCheck:   true,
    historyApiFallback: true
  }
};
