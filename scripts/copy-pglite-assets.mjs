import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fromDir = join(root, "node_modules/@electric-sql/pglite/dist");
const toDir = join(root, ".vercel/output/functions/__server.func/_libs");
const files = ["pglite.data", "pglite.wasm", "initdb.wasm"];

await mkdir(toDir, { recursive: true });
await Promise.all(
  files.map((name) => copyFile(join(fromDir, name), join(toDir, name))),
);
