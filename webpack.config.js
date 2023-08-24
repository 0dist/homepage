

const path = require("path");
const bundleName = "index.js";
const dist = "dist/"+require("./package.json").name+"";

const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlReplaceWebpackPlugin = require("html-replace-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");
// css entry file leaves empty js file
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPluign = require("terser-webpack-plugin");


module.exports = {
	mode: "production",
	entry: {
		"./js/index": "./src/js/index.js",
		"./js/theme": "./src/js/theme.js",
		"./main": "./src/main.css",
	},

	output : {
	    path: path.resolve(__dirname, dist),
	    clean: true
	},

	module: {
	    rules: [
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, "css-loader"],
			}
	    ]
	},

	optimization: {
		minimizer: [new CssMinimizerPlugin(), new TerserPluign()]
	},

	plugins: [
		new HtmlWebpackPlugin({
			template: "src/index.html",
			inject: false
		}),
		new HtmlReplaceWebpackPlugin({
			pattern: `<script type="module" src="js/${bundleName}"></script>`,
			replacement: `<script src="js/${bundleName}"></script>`
		}),
		new FileManagerPlugin({
			events: {
				onEnd: {
					copy: [
						{source: "src/fonts", destination: `${dist}/fonts`},
						{source: "src/icons", destination: `${dist}/icons`},
						{source: "src/manifest.json", destination: `${dist}/manifest.json`}
					],
					archive: [
						{source: dist, destination: `${dist}_${require("./package.json").version}.zip`}
					],
					delete: [dist]
				}
			}
		}),
		new RemoveEmptyScriptsPlugin(),
		new MiniCssExtractPlugin()
	]
}