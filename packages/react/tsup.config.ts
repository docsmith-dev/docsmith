import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  external: [
    'react',
    'react-dom',
    '@docsmith/core',
    '@remix-run/react',
    'virtual:docsmith'
  ],
  sourcemap: true,
  clean: true,
});