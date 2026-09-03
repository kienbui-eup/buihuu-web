import {rollupPluginHTML as html} from '@web/rollup-plugin-html'
import {polyfillsLoader} from '@web/rollup-plugin-polyfills-loader'
import {injectManifest} from 'rollup-plugin-workbox'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript'
import copy from 'rollup-plugin-copy'
import versionInjector from 'rollup-plugin-version-injector'
import path from 'path'

const API_URL = process.env.API_URL === undefined ? '' : process.env.API_URL

const BASE_DIR = process.env.BASE_DIR === undefined ? '' : process.env.BASE_DIR

const developmentMode = process.env.ROLLUP_WATCH === 'true'

const outputDir = 'dist'

// updateViaCache:'none' tells the browser (especially Firefox) to always
// bypass its HTTP cache when checking for a new sw.js, so updates are
// detected on the next page load rather than after the Cache-Control TTL.
const swRegistrationScript = `<script>if('serviceWorker'in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(function(){console.log('ServiceWorker registered.')}).catch(function(err){console.log('ServiceWorker registration failed: ',err)})})}</script>`

export default {
  input: './index.html',
  preserveEntrySignatures: false,
  treeshake: !developmentMode,
  external: ['./config.js'],
  output: {
    dir: outputDir,
    format: 'es',
    entryFileNames: developmentMode ? '[name].js' : '[hash].js',
    // Chunk nạp động giữ tên module trong tên file để service worker loại được
    // maplibre và graphviz-wasm khỏi danh sách precache (xem globIgnores).
    chunkFileNames: developmentMode ? '[name].js' : '[name]-[hash].js',
    assetFileNames: developmentMode ? '[name][extname]' : '[hash][extname]',
    plugins: [
      injectManifest({
        swSrc: 'src/sw.js',
        swDest: path.join(outputDir, 'sw.js'),
        globDirectory: outputDir,
        globPatterns: ['**/*.{html,js,css,webmanifest}'],
        globIgnores: [
          'polyfills/*.js',
          'legacy-*.js',
          'nomodule-*.js',
          'index.html',
          'config.js',
          // Thư viện nặng chỉ nạp khi cần, không bắt mọi điện thoại tải sẵn
          // trong nền: maplibre (bản đồ), các gói wasm của @hpcc-js (graphviz
          // cho biểu đồ quan hệ; duckdb, zstd, expat, base91 không dùng nhưng
          // rollup vẫn tách ra), và chunk của Web Awesome (bộ chọn màu thẻ).
          'maplibre-gl-*.js',
          'graphviz-*.js',
          'duckdb-*.js',
          'zstd-*.js',
          'expat-*.js',
          'base91-*.js',
          'chunk.*.js',
        ],
      }),
    ],
  },
  plugins: [
    html({
      minify: !developmentMode,
      extractAssets: false,
      transformHtml: [
        htmlStr =>
          htmlStr.replace('<base href="/">', `<base href="${BASE_DIR}/">`),
        htmlStr => htmlStr.replace('</body>', `${swRegistrationScript}</body>`),
      ],
    }),
    resolve(),
    typescript({outDir: outputDir, declaration: false}),
    !developmentMode && terser({format: {comments: false}}),
    polyfillsLoader({polyfills: {}, minify: !developmentMode}),
    copy({
      targets: [
        {
          src: 'node_modules/@awesome.me/webawesome/dist/styles/**/*',
          dest: 'dist/webawesome-styles',
        },
        {src: './maplibre-gl.css', dest: 'dist/'},
        {src: './global.css', dest: 'dist/'},
        {src: './tippy.css', dest: 'dist/'},
        {src: './src/config.js', dest: 'dist/'},
        {src: './manifest.json', dest: 'dist/'},
        {src: './images/**/*', dest: 'dist/images'},
        {src: './fonts/**/*', dest: 'dist/fonts'},
        {src: './lang/*', dest: 'dist/lang'},
      ],
    }),
    replace({
      'http://localhost:5555': API_URL,
      BASE_DIR: JSON.stringify(BASE_DIR),
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    versionInjector(),
  ].filter(Boolean),
}
