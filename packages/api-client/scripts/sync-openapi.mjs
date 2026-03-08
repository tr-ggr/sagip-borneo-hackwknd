import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const OPENAPI_URL = process.env.API_OPENAPI_URL ?? 'http://localhost:3333/api/openapi.json';
const outputPath = resolve(process.cwd(), 'openapi', 'openapi.json');

const response = await fetch(OPENAPI_URL);
if (!response.ok) {
  throw new Error(`Failed to fetch OpenAPI from ${OPENAPI_URL}: ${response.status} ${response.statusText}`);
}

const json = await response.json();
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');

console.log(`Synced OpenAPI spec to ${outputPath}`);
