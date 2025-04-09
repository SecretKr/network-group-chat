module.exports = {
  // Other Webpack configurations...

  module: {
    rules: [
      // CSS Loader rule
      {
        test: /\.css$/,
        use: [
          "style-loader", // Injects CSS into the DOM
          "css-loader", // Resolves CSS imports
          "postcss-loader", // Processes CSS with PostCSS (including Tailwind)
        ],
      },
    ],
  },

  // Other configurations...
};
