module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: "./src/mjs/main.mjs",
    output: {
        filename: "./application.js"
    },
    module: {
        rules: [
            {
                test: /\.mjs$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    }
}