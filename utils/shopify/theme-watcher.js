import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { build } from 'esbuild';
import chokidar from 'chokidar';
import { globby } from 'globby';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import * as sass from 'sass';

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'src');
const COMPONENTS_DIR = path.join(SOURCE_DIR, 'components');
const ASSETS_DIR = path.join(SOURCE_DIR, 'assets');
const SHOPIFY_DIR = path.join(ROOT, 'shopify');
const SHOPIFY_ASSETS_DIR = path.join(SHOPIFY_DIR, 'assets');
const SHOPIFY_SECTIONS_DIR = path.join(SHOPIFY_DIR, 'sections');
const SHOPIFY_SNIPPETS_DIR = path.join(SHOPIFY_DIR, 'snippets');
const MAIN_ENTRY = path.join(SOURCE_DIR, 'entrypoints', 'main.js');

const componentSourcePatterns = [
  'src/components/**/section.*.liquid',
  'src/components/**/section.*.json',
  'src/components/**/snippet.*.liquid',
];

const watchDirectories = [
  ASSETS_DIR,
  COMPONENTS_DIR,
  path.join(SOURCE_DIR, 'entrypoints'),
  path.join(SOURCE_DIR, 'helpers'),
];

function output(message) {
  console.log(`[theme] ${message}`);
}

function isWithin(directory, filePath) {
  const relativePath = path.relative(directory, filePath);

  return relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
}

function getComponentTarget(filePath) {
  const fileName = path.basename(filePath);
  const section = fileName.match(/^section\.(.+)\.(liquid|json)$/);

  if (section) {
    return path.join(SHOPIFY_SECTIONS_DIR, `${section[1]}.${section[2]}`);
  }

  const snippet = fileName.match(/^snippet\.(.+)\.liquid$/);

  if (snippet) {
    return path.join(SHOPIFY_SNIPPETS_DIR, `${snippet[1]}.liquid`);
  }

  return null;
}

function getAssetTarget(filePath) {
  return path.join(SHOPIFY_ASSETS_DIR, path.basename(filePath));
}

async function ensureThemeDirectories() {
  await Promise.all([
    fs.mkdir(SHOPIFY_ASSETS_DIR, { recursive: true }),
    fs.mkdir(SHOPIFY_SECTIONS_DIR, { recursive: true }),
    fs.mkdir(SHOPIFY_SNIPPETS_DIR, { recursive: true }),
  ]);
}

async function copyFile(sourcePath, destinationPath) {
  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.copyFile(sourcePath, destinationPath);
}

async function syncSourceFile(filePath) {
  const absolutePath = path.resolve(filePath);

  if (isWithin(ASSETS_DIR, absolutePath)) {
    await copyFile(absolutePath, getAssetTarget(absolutePath));
    return true;
  }

  if (isWithin(COMPONENTS_DIR, absolutePath)) {
    const target = getComponentTarget(absolutePath);

    if (target) {
      await copyFile(absolutePath, target);
      return true;
    }
  }

  return false;
}

async function removeSyncedFile(filePath) {
  const absolutePath = path.resolve(filePath);
  let target;

  if (isWithin(ASSETS_DIR, absolutePath)) {
    target = getAssetTarget(absolutePath);
  } else if (isWithin(COMPONENTS_DIR, absolutePath)) {
    target = getComponentTarget(absolutePath);
  }

  if (!target) {
    return false;
  }

  await fs.rm(target, { force: true });
  return true;
}

async function syncThemeFiles() {
  await ensureThemeDirectories();

  const sourceFiles = await globby(['src/assets/**/*', ...componentSourcePatterns], {
    onlyFiles: true,
  });

  await Promise.all(sourceFiles.map((filePath) => syncSourceFile(filePath)));
}

async function findComponentModules() {
  const files = await globby('src/components/**/*.js', {
    onlyFiles: true,
  });

  return files
    .filter((filePath) => path.basename(filePath, '.js') === path.basename(path.dirname(filePath)))
    .sort()
    .map((filePath) => ({
      name: path.basename(filePath, '.js'),
      filePath: path.resolve(filePath),
    }));
}

async function createComponentLoaderSource() {
  const componentModules = await findComponentModules();
  const loaders = componentModules
    .map(({ name, filePath }) => {
      let importPath = path.relative(path.dirname(MAIN_ENTRY), filePath).replaceAll('\\', '/');

      if (!importPath.startsWith('.')) {
        importPath = `./${importPath}`;
      }

      return `  ${JSON.stringify(name)}: () => import(${JSON.stringify(importPath)}),`;
    })
    .join('\n');

  return `const componentLoaders = {\n${loaders}\n};\n`;
}

function sassPlugin() {
  return {
    name: 'sass',
    setup(buildContext) {
      buildContext.onLoad({ filter: /\.scss$/ }, async (args) => {
        const result = await sass.compileAsync(args.path, {
          loadPaths: [SOURCE_DIR],
          style: 'expanded',
        });
        const processed = await postcss([autoprefixer]).process(result.css, {
          from: args.path,
        });

        return {
          contents: processed.css,
          loader: 'css',
          resolveDir: path.dirname(args.path),
        };
      });
    },
  };
}

function componentLoaderPlugin() {
  return {
    name: 'component-loaders',
    setup(buildContext) {
      buildContext.onLoad({ filter: /\.js$/ }, async (args) => {
        if (path.resolve(args.path) !== MAIN_ENTRY) {
          return null;
        }

        const source = await fs.readFile(args.path, 'utf8');
        const generatedLoaders = await createComponentLoaderSource();
        const dynamicImport = 'const module = await import(`~components/${component}/${component}.js`);';

        if (!source.includes(dynamicImport)) {
          throw new Error('Could not replace the component loader in src/entrypoints/main.js.');
        }

        return {
          contents: `${generatedLoaders}\n${source.replace(
            dynamicImport,
            [
              'const loadComponent = componentLoaders[component];',
              '      if (!loadComponent) {',
              '        throw new Error(`No JavaScript module found for component "${component}".`);',
              '      }',
              '      const module = await loadComponent();',
            ].join('\n      '),
          )}`,
          loader: 'js',
          resolveDir: path.dirname(args.path),
        };
      });
    },
  };
}

async function buildAssets() {
  await ensureThemeDirectories();

  await build({
    absWorkingDir: ROOT,
    alias: {
      '@': SOURCE_DIR,
      '~components': COMPONENTS_DIR,
      '~helpers': path.join(SOURCE_DIR, 'helpers'),
    },
    bundle: true,
    entryNames: '[name].min',
    entryPoints: {
      main: MAIN_ENTRY,
      style: path.join(SOURCE_DIR, 'entrypoints', 'style.scss'),
    },
    format: 'iife',
    minify: true,
    outdir: SHOPIFY_ASSETS_DIR,
    platform: 'browser',
    plugins: [componentLoaderPlugin(), sassPlugin()],
    target: ['es2020'],
  });
}

async function buildTheme() {
  await syncThemeFiles();
  await buildAssets();
  output('built theme assets');
}

function needsAssetBuild(filePath) {
  const extension = path.extname(filePath);

  return extension === '.js' || extension === '.scss';
}

async function main() {
  const buildOnce = process.argv.includes('--once');

  await buildTheme();

  if (buildOnce) {
    return;
  }

  let buildInProgress = false;
  let buildAgain = false;
  let buildTimer;

  async function rebuild() {
    if (buildInProgress) {
      buildAgain = true;
      return;
    }

    buildInProgress = true;

    try {
      await buildAssets();
      output('rebuilt theme assets');
    } catch (error) {
      console.error(error);
    } finally {
      buildInProgress = false;

      if (buildAgain) {
        buildAgain = false;
        await rebuild();
      }
    }
  }

  function scheduleRebuild() {
    clearTimeout(buildTimer);
    buildTimer = setTimeout(() => {
      rebuild();
    }, 150);
  }

  const watcher = chokidar.watch(watchDirectories, {
    awaitWriteFinish: {
      stabilityThreshold: 150,
      pollInterval: 50,
    },
    ignoreInitial: true,
  });

  watcher.on('add', async (filePath) => {
    await syncSourceFile(filePath);

    if (needsAssetBuild(filePath)) {
      scheduleRebuild();
    }
  });

  watcher.on('change', async (filePath) => {
    await syncSourceFile(filePath);

    if (needsAssetBuild(filePath)) {
      scheduleRebuild();
    }
  });

  watcher.on('unlink', async (filePath) => {
    await removeSyncedFile(filePath);

    if (needsAssetBuild(filePath)) {
      scheduleRebuild();
    }
  });

  watcher.on('error', (error) => {
    console.error(error);
  });

  output('watching source files');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
