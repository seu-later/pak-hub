/* Download only missing audit packages, verifying the content-addressed key. */
import { promises as fs } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

const directory = path.resolve(".dump-audit");
const ledger = JSON.parse(await fs.readFile(path.join(directory, "ledger.json"), "utf8"));
await fs.mkdir(path.join(directory, "packages"), { recursive: true });
const missing = ledger.records.filter((record) => !record.packagePath);
let cursor = 0;
let completed = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < missing.length) {
    const record = missing[cursor++];
    try {
      const output = path.join(directory, "packages", record.key);
      let data;
      try { data = await fs.readFile(output); } catch (error) { if (error.code !== "ENOENT") throw error; }
      if (!data) {
        const response = await fetch(`https://pak-hub.pages.dev/api/dump-file/${record.key}`, { signal: AbortSignal.timeout(120000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        data = Buffer.from(await response.arrayBuffer());
      }
      if (createHash("sha256").update(data).digest("hex") !== record.sha256) throw new Error("SHA-256 mismatch");
      if (data.length !== record.sizeBytes) throw new Error("Size mismatch");
      await fs.writeFile(output, data);
      record.packagePath = output;
      delete record.downloadError;
    } catch (error) { record.downloadError = error.message; }
    completed += 1;
    if (completed % 20 === 0) console.log(`Downloaded ${completed}/${missing.length}`);
  }
}));
await fs.writeFile(path.join(directory, "ledger.json"), JSON.stringify(ledger, null, 2));
await fs.writeFile(path.join(directory, "packages.json"), JSON.stringify({ records: ledger.records.filter((r) => r.packagePath).map((r) => ({ ...r, group: r.groups[0] })) }, null, 2));
console.log(JSON.stringify({ located: ledger.records.filter((r) => r.packagePath).length,
  errors: ledger.records.filter((r) => r.downloadError).map((r) => ({ filename: r.filename, error: r.downloadError })) }));
