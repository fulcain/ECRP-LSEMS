import { readFile } from "node:fs/promises";
import { MongoClient } from "mongodb";

import type { PaperworkConfig } from "@/lib/paperwork/schema";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not configured.");
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8_000 });

function stats(config: PaperworkConfig) {
  const formats = config.division.pages.flatMap((page) => page.groups.flatMap((group) => group.formats));
  return {
    pages: config.division.pages.length,
    groups: config.division.pages.reduce((sum, page) => sum + page.groups.length, 0),
    formats: formats.length,
    fields: formats.reduce((sum, format) => sum + format.fields.length, 0),
    actions: formats.reduce((sum, format) => sum + format.actions.length, 0),
    templates: formats.filter((format) => Boolean(format.template.trim())).length,
  };
}

function differences(expected: unknown, actual: unknown, path = "config", out: string[] = []): string[] {
  if (out.length >= 80) return out;
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

const sourceKeys = ["amu", "bls", "red", "ar"];
const sources = new Map<string, PaperworkConfig>();
for (const key of sourceKeys) {
  sources.set(key, JSON.parse(await readFile(`src/app/constants/paperwork/generated/${key}.json`, "utf8")) as PaperworkConfig);
}

try {
  await client.connect();
  const db = client.db("ecrp_lsems");
  const current = await db.collection<{ _id: string; config: PaperworkConfig }>("paperwork_configs").find({}).sort({ _id: 1 }).toArray();
  const revisions = await db.collection<{ _id: unknown; divisionKey?: string; savedAt?: Date; config?: PaperworkConfig }>("paperwork_config_revisions").find({}).sort({ savedAt: 1 }).toArray();
  const main = current.map((entry) => {
    const source = sources.get(entry._id);
    return {
      key: entry._id,
      stats: stats(entry.config),
      sourceStats: source ? stats(source) : null,
      differences: source ? differences(source, entry.config) : ["no bundled source config"],
    };
  });
  const revisionAudit = revisions.map((revision) => {
    const source = revision.divisionKey ? sources.get(revision.divisionKey) : undefined;
    const latest = current.find((entry) => entry._id === revision.divisionKey)?.config;
    const sourceDiff = source && revision.config ? differences(source, revision.config) : ["no matching source"];
    const latestDiff = latest && revision.config ? differences(latest, revision.config) : ["no current main config"];
    return {
      id: String(revision._id),
      divisionKey: revision.divisionKey ?? "unknown",
      savedAt: revision.savedAt?.toISOString() ?? "unknown",
      stats: revision.config ? stats(revision.config) : null,
      differsFromSource: sourceDiff.length > 0,
      differsFromCurrent: latestDiff.length > 0,
      sourceDifferences: sourceDiff.slice(0, 30),
      currentDifferences: latestDiff.slice(0, 30),
    };
  });
  console.log(JSON.stringify({ currentCount: current.length, main, revisionCount: revisions.length, revisions: revisionAudit }, null, 2));
} finally {
  await client.close();
}
