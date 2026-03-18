import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginClient } from '@kubb/plugin-client'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginZod } from '@kubb/plugin-zod'
import { pluginTs } from '@kubb/plugin-ts'

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
})
