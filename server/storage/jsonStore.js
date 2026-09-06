import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export function createJsonStore(filePath, initialValue) {
  async function read() {
    try {
      return JSON.parse(await readFile(filePath, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await write(initialValue);
      return structuredClone(initialValue);
    }
  }

  async function write(value) {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(value, null, 2));
  }

  return { read, write };
}
