import { writeFile } from 'node:fs/promises';

await writeFile('dist/.assetsignore', '_worker.js\n');