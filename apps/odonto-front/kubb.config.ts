import { defineConfig } from '@kubb/core';
import { pluginClient } from '@kubb/plugin-client';
import { pluginOas } from '@kubb/plugin-oas';
import { pluginReactQuery } from '@kubb/plugin-react-query';
import { pluginTs } from '@kubb/plugin-ts';
import { pluginZod } from '@kubb/plugin-zod';

export default defineConfig({
  root: '.',
  input: {
    path: '../odonto-api/openapi.json',
  },
  output: {
    path: './src/generated',
    clean: true,
  },
  plugins: [
    pluginOas({ validate: true }),
    pluginTs({ output: { path: './ts' } }),
    pluginZod({ output: { path: './zod' } }),
    pluginClient({
      output: { path: './clients' },
      importPath: '@/lib/api',
    }),
    pluginReactQuery({
      output: { path: './hooks' },
      client: {
        importPath: '@/lib/api',
      },
    }),
  ],
});
