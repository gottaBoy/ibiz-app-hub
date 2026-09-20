/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    coverage: {
      enabled: false,
      provider: 'istanbul',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/interface/**'],
    },
    server: {
      deps: {
        inline: [
          '@ibiz-template/core',
          'async-validator',
          'dayjs',
          'echarts',
          'handlebars',
          'lodash-es',
          'mqtt/dist/mqtt.min',
          'path-browserify',
          'qs',
          'qx-util',
          'ramda',
        ],
      },
    },
  },
});
