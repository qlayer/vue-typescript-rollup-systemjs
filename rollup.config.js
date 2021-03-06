import path from 'path'
import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import VuePlugin from 'rollup-plugin-vue';
import { uglify } from 'rollup-plugin-uglify';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';
import alias from 'rollup-plugin-alias';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import buble from 'rollup-plugin-buble'
import nodeGlobals from 'rollup-plugin-node-globals';

let plugins = [
  alias({
    vue$: 'vue/dist/vue.common.js',
    '@': path.resolve('./src/'),
    resolve: ['.vue', '.ts']
  }),
  typescript(),
  VuePlugin(),

  buble({
    objectAssign: 'Object.assign'
  }),
  resolve({
    jsnext: true,
    main: true,
    browser: true
  }),
  commonjs(),
  nodeGlobals()

]

let config = {
  input: [
    "src/accounts/entry.accounts.ts",
    "src/clients/entry.clients.ts"
  ],
  output: [
    {
      dir: "public/nomodule",
      format: "system",
      sourcemap: true
    }
  ],
  external: ['vue'],
  experimentalCodeSplitting: true,
  plugins: plugins
};

const isProduction = process.env.NODE_ENV === `production`
const isDevelopment = !isProduction


if (isProduction) {
  config.output.sourcemap = false;
  if (Array.isArray(config.output)) {
    config.output.forEach((item) => {
      item.sourcemap = false;
    });
  }
  
  config.plugins.push(
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  );
  config.plugins.push(uglify())
}

if (isDevelopment) {
  config.plugins.push(
    serve({
      contentBase: './public',
      port: 5000,
      open: true
    })
  )
  config.plugins.push(
    livereload({
      watch: './public/nomodule/'
    })
  )
}

export default [
  config,
  {
    input: "src/shim-polyfill.ts",
    output: [{
      file: "public/polyfills.js",
      format: "iife",
      sourcemap: false
    }],
    plugins: plugins
  }
];