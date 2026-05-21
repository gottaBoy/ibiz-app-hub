/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import { defineConfig } from '@ibiz-template/cli';

const cwd = process.cwd();

const root = path.resolve(cwd, 'src');

export default defineConfig({
  rootDir: root,
  bundles: [
    {
      input: 'index.ts',
      output: [
        {
          format: 'system',
          dir: 'dist',
          entryFileNames: '[name].system.min.js',
          sourcemap: false,
        },
      ],
    },
  ],
  theme: {
    prefix: `@import "${path.resolve(
      cwd,
      'node_modules/@ibiz-template/theme/style/global.scss',
    )}";`,
    output: ['es', 'lib'],
  },
  external: [],
});
