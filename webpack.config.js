

const path = require("path");
const bundleName = "index.js", packageName = require("./package.json").name;
const distPath = `dist/${packageName}`;

const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlReplaceWebpackPlugin = require("html-replace-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPluign = require("terser-webpack-plugin");


module.exports = {
	mode: "production",
	entry: [
		path.resolve(__dirname, "src/js/index.js"),
		path.resolve(__dirname, "src/main.css")
	],

	output : {
	    path: path.resolve(__dirname, distPath),
	    filename: bundleName,
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
						{source: "src/fonts", destination: `${distPath}/fonts`},
						{source: "src/icons", destination: `${distPath}/icons`},
						{source: "src/js/theme.js", destination: `${distPath}/js/theme.js`},
						{source: "src/manifest.json", destination: `${distPath}/manifest.json`}
					],
					move: [
						{source: `${distPath}/${bundleName}`, destination: `${distPath}/js/${bundleName}`}
					],
					archive: [
						{source: distPath, destination: `${distPath}_${require("./package.json").version}.zip`}
					],
					delete: [distPath]
				}
			}
		}),
		new MiniCssExtractPlugin()
	]
}