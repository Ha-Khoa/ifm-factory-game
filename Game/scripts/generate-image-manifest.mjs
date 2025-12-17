import { readdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = path.resolve(process.cwd());
const imagesDir = path.join(projectRoot, 'public', 'images');
const outFile = path.join(projectRoot, 'public', 'images.manifest.json');

const allowedExt = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walk(fullPath)));
      continue;
    }
    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (!allowedExt.has(ext)) continue;

    // Ensure it's a real file (avoid dangling links)
    const s = await stat(fullPath);
    if (!s.isFile()) continue;

    const relFromImages = path.relative(imagesDir, fullPath).split(path.sep).join('/');
    results.push(`/images/${relFromImages}`);
  }

  return results;
}

async function main() {
  try {
    const files = await walk(imagesDir);
    files.sort((a, b) => a.localeCompare(b));
    await writeFile(outFile, JSON.stringify(files, null, 2) + '\n', 'utf8');
    process.stdout.write(`Wrote ${files.length} entries to ${path.relative(projectRoot, outFile)}\n`);
  } catch (err) {
    // Fail loud so CI/build doesn't silently ship without manifest
    console.error('Failed to generate image manifest:', err);
    process.exitCode = 1;
  }
}

await main();
