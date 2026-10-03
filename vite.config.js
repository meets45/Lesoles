import path from 'path';
import { defineConfig, normalizePath } from 'vite';
import shopify from 'vite-plugin-shopify';
import copyPlugin from './utils/vite/copy-plugin';
import manageShopifyDirectoriesPlugin from './utils/vite/manage-shopify-directories.js';

export default defineConfig(({ command }) => {
  const isProduction = command === 'build';

  return {
    build: {
      emptyOutDir: false,
      rollupOptions: {
        output: {
          entryFileNames: '[name].min.js',
          chunkFileNames: '[name].min.js',
          assetFileNames: '[name].min.[ext]',
        },
      },
    },
    resolve: {
      alias: {
        '~components': normalizePath(path.resolve('src/components')),
        '~helpers': normalizePath(path.resolve('src/helpers')),
      },
    },
    plugins: [
      shopify({
        themeRoot: './shopify',
        sourceCodeDir: 'src',
        entrypointsDir: 'src/entrypoints',
        versionNumbers: true,
      }),
      copyPlugin({
        isProduction,
        watch: './src/components',
        targets: [
          {
            src: normalizePath(
              path.resolve('src/components/**/section.*.(liquid|json)')
            ),
            dest: 'shopify/sections',
            rename(name, extension) {
              return `${path.basename(name, `.${extension}`).split('.')[1]}.${extension}`;
            },
          },
          {
            src: normalizePath(
              path.resolve('src/components/**/snippet.*.liquid')
            ),
            dest: 'shopify/snippets',
            rename(name) {
              return `${path.basename(name, '.liquid').split('.')[1]}.liquid`;
            },
          },
          {
            src: normalizePath(path.resolve('src/assets/**/*.*')),
            dest: 'shopify/assets',
          },
        ],
      }),
      manageShopifyDirectoriesPlugin({ isProduction }),
    ],
  };
});
