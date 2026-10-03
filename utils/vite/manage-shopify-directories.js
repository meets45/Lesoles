import path from 'path';
import fs from 'fs/promises';
import chokidar from 'chokidar';
import { deleteAsync } from 'del';

/**
 * A Vite plugin to manage Shopify directories (clean them in production, ensure
 * they exist, and watch/unlink files in dev).
 *
 * @param {object} options
 * @param {boolean} options.isProduction - Whether we are in production mode.
 */
export default function manageShopifyDirectoriesPlugin({ isProduction }) {
  const shopifyDirs = [
    'shopify/sections',
    'shopify/snippets',
    'shopify/assets',
  ];

  const ensureShopifyDirsExist = async () => {
    for (const dir of shopifyDirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  };

  const cleanShopifyDirectories = async () => {
    await ensureShopifyDirsExist();
    for (const dir of shopifyDirs) {
      await deleteAsync([`${dir}/*`]);
    }
  };

  const watchSourceDeletions = () => {
    const srcDir = path.resolve('src/components');
    const sectionsDir = path.resolve('shopify/sections');
    const snippetsDir = path.resolve('shopify/snippets');

    chokidar
      .watch(`${srcDir}/**/*`, { ignoreInitial: true })
      .on('unlink', async (filePath) => {
        const fileName = path.basename(filePath);

        await ensureShopifyDirsExist();

        if (fileName.startsWith('section.')) {
          const extension = path.extname(fileName);
          const sectionName = fileName.split('.')[1];
          const sectionPath = path.join(sectionsDir, `${sectionName}${extension}`);
          await fs.unlink(sectionPath).catch(() => {});
        } else if (fileName.startsWith('snippet.')) {
          const snippetName = fileName.split('.')[1];
          const snippetPath = path.join(snippetsDir, `${snippetName}.liquid`);
          await fs.unlink(snippetPath).catch(() => {});
        }
      });
  };

  return {
    name: 'manage-shopify-directories',
    async buildStart() {
      if (isProduction) {
        await cleanShopifyDirectories();
      } else {
        await ensureShopifyDirsExist();
      }
    },
    async configureServer() {
      await ensureShopifyDirsExist();
      if (!isProduction) watchSourceDeletions();
    },
  };
}
