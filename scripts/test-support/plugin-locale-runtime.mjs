import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const hostRequire = createRequire(
  resolve(repositoryRoot, 'components/ibiz-next-vue3/package.json'),
);

// Compile the editable locale source, not a potentially stale published bundle.
export async function loadLocaleModule(file) {
  const entry = resolve(repositoryRoot, file);
  const require = createRequire(entry);
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: 'node20',
    write: false,
    logLevel: 'silent',
    plugins: [{
      name: 'locale-only-dependencies',
      setup(builder) {
        builder.onResolve({ filter: /^vue(?:-i18n)?$/ }, args => ({
          path: hostRequire.resolve(args.path),
          external: true,
        }));
        builder.onResolve(
          { filter: /^@ibiz-template\/(core|runtime|model-helper|vue3-util)$/ },
          args => ({
            path: resolve(repositoryRoot, 'packages', args.path.split('/')[1], 'src/locale/index.ts'),
          }),
        );
      },
    }],
  });
  const module = { exports: {} };
  new Function('module', 'exports', 'require', result.outputFiles[0].text)(
    module, module.exports, require,
  );
  return module.exports;
}

export function flattenMessages(value, prefix = '', result = {}) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === 'string') result[path] = child;
    else if (child && typeof child === 'object' && !Array.isArray(child)) {
      flattenMessages(child, path, result);
    } else {
      throw new Error(`Invalid translation value: ${path}`);
    }
  }
  return result;
}

export function placeholders(value) {
  return [...new Set([...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]))].sort();
}
