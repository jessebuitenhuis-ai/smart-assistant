const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

// Use api/ folder for Vercel deployment, dist/backend for local
const isVercel = process.env.VERCEL === '1';
const outputPath = isVercel
  ? join(__dirname, '../../api')
  : join(__dirname, '../../dist/backend');

module.exports = {
  output: {
    path: outputPath,
    filename: isVercel ? 'index.js' : 'main.js',
    library: {
      type: 'commonjs2',
    },
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMaps: true,
    }),
  ],
};
