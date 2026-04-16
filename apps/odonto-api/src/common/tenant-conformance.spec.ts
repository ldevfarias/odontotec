import * as fs from 'fs';
import * as path from 'path';

function getControllerFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getControllerFiles(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.controller.ts') &&
      !entry.name.endsWith('.spec.ts')
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Tenant isolation conformance', () => {
  it('no controller file should import or call getClinicId', () => {
    const modulesDir = path.join(__dirname, '../modules');
    const controllerFiles = getControllerFiles(modulesDir);

    const violators: string[] = [];
    for (const file of controllerFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('getClinicId')) {
        violators.push(path.relative(process.cwd(), file));
      }
    }

    expect(violators).toEqual([]);
  });
});
