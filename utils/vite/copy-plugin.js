import path from 'path';
import fs from 'fs-extra';
import { normalizePath } from 'vite';
import chokidar from 'chokidar';
import { globby } from 'globby';
import { isPlainObject } from 'is-plain-object';

/**
 * A Rollup/Vite plugin that copies matched files to destinations,
 * but in watch mode, only copies the single changed file instead
 * of re-copying everything on each change.
 *
 * @param {object} options
 * @param {boolean} [options.isProduction=false] - Are we in production mode?
 * @param {string|string[]} [options.watch] - Glob(s)/path(s) to watch in dev.
 * @param {Array<object>} options.targets - Copy instructions, each with `src`, `dest`.
 */
export default function copyPlugin(options = {}) {
  const {
    isProduction = false,
    watch: watchPattern,
    targets = [],
  } = options;

  // If no targets, do nothing
  if (!Array.isArray(targets) || targets.length === 0) {
    return { name: 'copy-changed' };
  }

  // Runs once at build (full copy).
  async function doFullCopy() {
    for (const target of targets) {
      await copyTargetSet(target);
    }
  }

  // Copies *all files* matching a single `target.src` to `target.dest`.
  async function copyTargetSet(target) {
    if (!isPlainObject(target) || !target.src || !target.dest) {
      throw new Error(
        `Invalid target. Must be an object with "src" and "dest": ${JSON.stringify(target)}`
      );
    }

    const {
      src,
      dest,
      flatten = true,
      rename,
      transform,
      ...rest
    } = target;

    const matchedPaths = await globby(src, {
      onlyFiles: true,
      expandDirectories: false,
      ...rest,
    });

    for (const filePath of matchedPaths) {
      await copySingleFile({
        filePath,
        dest,
        flatten,
        rename,
        transform,
        ...rest,
      });
    }
  }

  // Copies exactly one file according to target config.
  async function copySingleFile({ filePath, dest, flatten = true, rename, transform, ...rest }) {
    const { base, dir } = path.parse(filePath);

    let relativePath;
    if (!Array.isArray(dest)) {
      relativePath = flatten
        ? path.join(dest, rename ? maybeRename(base, rename) : base)
        : path.join(
            dest,
            path.relative(path.resolve(dir, '..'), dir),
            rename ? maybeRename(base, rename) : base
          );
    }

    async function doCopyTo(destination) {
      if (transform) {
        const originalContents = await fs.readFile(filePath);
        const transformedContents = await transform(originalContents, filePath);
        await fs.outputFile(destination, transformedContents, rest);
      } else {
        await fs.copy(filePath, destination, rest);
      }
    }

    if (Array.isArray(dest)) {
      for (const d of dest) {
        const finalPath = flatten
          ? path.join(d, rename ? maybeRename(base, rename) : base)
          : path.join(
              d,
              path.relative(path.resolve(dir, '..'), dir),
              rename ? maybeRename(base, rename) : base
            );
        await doCopyTo(finalPath);
      }
    } else {
      await doCopyTo(relativePath);
    }
  }

  function maybeRename(fileName, rename) {
    if (typeof rename === 'string') {
      return rename;
    } else if (typeof rename === 'function') {
      const extension = path.extname(fileName).slice(1);
      const name = path.basename(fileName, `.${extension}`);
      return rename(name, extension);
    }
    return fileName;
  }

  // This function checks which target(s) match the changed file and copies only that file.
  async function handleSingleChange(changedFile) {
    let changedFileAbsolute = path.resolve(changedFile);
    changedFileAbsolute = normalizePath(changedFileAbsolute);

    for (const target of targets) {
      const matchedPaths = await globby(target.src, {
        onlyFiles: true,
        expandDirectories: false,
      });
      const matchedPathsNormalized = matchedPaths.map((p) => normalizePath(p));

      if (matchedPathsNormalized.includes(changedFileAbsolute)) {
        await copySingleFile({
          filePath: changedFileAbsolute,
          ...target,
        });
      }
    }
  }

  let hasCopiedOnce = false;

  return {
    name: 'copy-plugin',
    async buildEnd() {
      if (!isProduction) {
        if (!hasCopiedOnce) {
          await doFullCopy();
          hasCopiedOnce = true;
        }
      } else {
        await doFullCopy();
      }
    },

    configureServer() {
      if (!isProduction && watchPattern) {
        const watcher = chokidar.watch(watchPattern, {
          ignoreInitial: true,
        });
        watcher.on('change', async (changedFile) => {
          await handleSingleChange(changedFile);
        });
        watcher.on('add', async (addedFile) => {
          await handleSingleChange(addedFile);
        });
      }
    },
  };
}
