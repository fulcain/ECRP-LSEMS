import { readFile } from "node:fs/promises";
import { MongoClient } from "mongodb";

import type { PaperworkConfig } from "@/lib/paperwork/schema";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not configured.");
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8_000 });
const sourceKeys = ["amu", "bls", "red", "ar"];

function differences(expected: unknown, actual: unknown, path = "config", out: string[] = []): string[] {
  if (Array.isArray(expected) || Array.isArray(actual)) {
    if (!Array.isArray(expected) || !Array.isArray(actual)) return [...out, path];
    if (expected.length !== actual.length) out.push(`${path}.length(${expected.length}/${actual.length})`);
    for (let i = 0; i < Math.min(expected.length, actual.length); i++) differences(expected[i], actual[i], `${path}[${i}]`, out);
    return out;
  }
  if (expected && actual && typeof expected === "object" && typeof actual === "object") {
    const a = expected as Record<string, unknown>;
    const b = actual as Record<string, unknown>;
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (key === "origin") continue;
      if (!(key in a) || !(key in b)) out.push(`${path}.${key}`);
      else differences(a[key], b[key], `${path}.${key}`, out);
    }
    return out;
  }
  if (expected !== actual) out.push(path);
  return out;
}

const sources = new Map<string, PaperworkConfig>();
for (const key of sourceKeys) {
  sources.set(key, JSON.parse(await readFile(`src/app/constants/paperwork/generated/${key}.json`, "utf8")) as PaperworkConfig);
}

try {
  await client.connect();
  const db = client.db("ecrp_lsems");
  const mainCollection = db.collection<{ _id: string; config: PaperworkConfig }>("paperwork_configs");
  const revisionCollection = db.collection<{ divisionKey?: string; config?: PaperworkConfig }>("paperwork_config_revisions");
  const [main, revisions] = await Promise.all([
    mainCollection.find({}).toArray(),
    revisionCollection.find({}).toArray(),
  ]);

  for (const [key, source] of sources) {
    const saved = main.find((entry) => entry._id === key)?.config;
    if (!saved || differences(source, saved).length) {
      throw new Error(`${key} main config does not fully match its recovered source; revisions were kept.`);
    }
  }

  const expected = new Map([
    ["bls", ["config.division.pages[0].groups[4].formats[0].template", "config.division.pages[0].groups[4].formats[1].template"]],
    ["red", ["config.division.pages[0].groups[5].formats[0].template"]],
  ]);
  if (revisions.length !== expected.size) {
    throw new Error(`Expected ${expected.size} audited revision snapshots, found ${revisions.length}; revisions were kept.`);
  }
  for (const revision of revisions) {
    const key = revision.divisionKey;
    const source = key ? sources.get(key) : undefined;
    const saved = key ? main.find((entry) => entry._id === key)?.config : undefined;
    const allowed = key ? expected.get(key) : undefined;
    if (!key || !source || !saved || !revision.config || !allowed) {
      throw new Error("An unexpected revision exists; revisions were kept.");
    }
    const sourceDiff = differences(source, revision.config);
    const savedDiff = differences(saved, revision.config);
    if (JSON.stringify(sourceDiff) !== JSON.stringify(allowed) || JSON.stringify(savedDiff) !== JSON.stringify(allowed)) {
      throw new Error(`${key} revision contains differences beyond the recovered source templates; revisions were kept.`);
    }
  }

  const dropped = await revisionCollection.drop();
  console.log(JSON.stringify({
    removedRevisionCollection: dropped,
    removedSnapshots: revisions.length,
    preservedMainConfigs: sourceKeys,
    reason: "All main configs match recovered sources; revisions only held superseded BLS/RED board placeholders.",
  }, null, 2));
} finally {
  await client.close();
}
