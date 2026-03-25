/**
 * Kubb CLI workaround for Node 20.11.x compatibility.
 *
 * The @kubb/cli package requires Node >=20.12 (uses util.styleText which was
 * introduced in 20.12). Until the project upgrades Node, we invoke Kubb's
 * build API directly, bypassing the CLI entry point.
 *
 * To retire this workaround: upgrade Node to >=20.12, restore `"kubb": "kubb"`
 * in package.json scripts, and delete this file.
 */
import { build } from '../../node_modules/@kubb/core/dist/index.js';
import { pluginOas } from '../../node_modules/@kubb/plugin-oas/dist/index.js';
import { pluginTs } from '../../node_modules/@kubb/plugin-ts/dist/index.js';
import { pluginZod } from '../../node_modules/@kubb/plugin-zod/dist/index.js';
import { pluginClient } from '../../node_modules/@kubb/plugin-client/dist/index.js';
import { pluginReactQuery } from '../../node_modules/@kubb/plugin-react-query/dist/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generate() {
  try {
    const result = await build({
      config: {
        root: __dirname,
        input: {
          path: join(__dirname, '../odonto-api/openapi.json'),
        },
        output: {
          path: join(__dirname, './src/generated'),
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
      },
    });
    console.log('Kubb generation complete!');
  } catch (err) {
    console.error('Kubb generation failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

generate();
