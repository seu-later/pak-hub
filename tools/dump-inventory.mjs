import { open, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const [, , inputPath, outputPath, unrealPakPath = "UnrealPak.exe"] = process.argv;
const workerCount = 12;

if (!inputPath || !outputPath) {
  console.error("Usage: node tools/dump-inventory.mjs <packages.json> <inventory.json> [UnrealPak.exe]");
  process.exitCode = 1;
}

async function listPackage(packagePath) {
  const handle = await open(packagePath, "r");
  const signature = Buffer.alloc(4);
  try { await handle.read(signature, 0, 4, 0); } finally { await handle.close(); }
  const isZip = signature.subarray(0, 2).toString("ascii") === "PK";
  const command = isZip ? "tar.exe" : unrealPakPath;
  const args = isZip ? ["-tf", packagePath] : [packagePath, "-List"];

  return new Promise((resolve) => {
    const child = spawn(command, args, { windowsHide: true });
    const chunks = [];
    const errors = [];
    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.stderr.on("data", (chunk) => errors.push(chunk));
    child.on("error", (error) => resolve({ files: [], error: error.message }));
    child.on("close", (code) => {
      const output = Buffer.concat(chunks).toString("utf8");
      const files = command === "tar.exe"
        ? output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
        : [...output.matchAll(/LogPakFile: Display: "([^"]+)"/g)].map((match) => match[1]);
      resolve({
        files,
        error: code === 0 ? "" : Buffer.concat(errors).toString("utf8").trim() || output.match(/PakFile was frozen[^\r\n]+/)?.[0] || `exit ${code}`,
      });
    });
  });
}

async function main() {
  if (!inputPath || !outputPath) return;
  const input = JSON.parse(await readFile(inputPath, "utf8"));
  const records = input.records || input;
  const results = Array(records.length);
  let cursor = 0;
  let completed = 0;

  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= records.length) return;
      const record = records[index];
      const inspected = await listPackage(record.packagePath);
      results[index] = { ...record, assets: inspected.files, error: inspected.error };
      completed += 1;
      if (completed % 50 === 0 || completed === records.length) {
        console.log(`Inspected ${completed}/${records.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: workerCount }, worker));
  await writeFile(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), records: results }, null, 2)}\n`);
}

await main();
