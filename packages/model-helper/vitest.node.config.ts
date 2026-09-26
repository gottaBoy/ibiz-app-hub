/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vitest/config';

// The package default runs vitest in browser mode, which needs a Playwright
// Chromium build this machine does not have. These tests only exercise pure
// model helpers, so a node environment is enough to gate them.
export default defineConfig({
  base: './',
  test: {
    environment: 'node',
    globals: true,
  },
});
