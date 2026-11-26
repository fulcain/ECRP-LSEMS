import { MongoClient, type Collection } from "mongodb";

import { validatePaperworkConfig, type PaperworkConfig } from "@/lib/paperwork/schema";

const COLLECTION_NAME = "paperwork_configs";
type StoredPaperwork = { _id: string; config: PaperworkConfig };

declare global {
  var paperworkMongo: Promise<MongoClient> | undefined;
}

function collection(): Promise<Collection<StoredPaperwork>> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured.");
  global.paperworkMongo ??= new MongoClient(uri, {
    serverSelectionTimeoutMS: 8_000,
  })
    .connect()
    .catch((error: unknown) => {
      global.paperworkMongo = undefined;
      throw error;
    });
  return global.paperworkMongo.then((client) =>
    client.db("ecrp_lsems").collection<StoredPaperwork>(COLLECTION_NAME),
  );
}

/** Seed a division once so the migration preserves its existing formats. */
export async function readPaperworkConfig(
  divisionKey: string,
  seed: PaperworkConfig,
): Promise<PaperworkConfig> {
  const configs = await collection();
  await configs.updateOne(
    { _id: divisionKey },
    { $setOnInsert: { config: seed } },
    { upsert: true },
  );
  const stored = await configs.findOne({ _id: divisionKey });
  const config = stored?.config ?? seed;
  if (!validatePaperworkConfig(config).ok) {
    throw new Error(`Stored ${divisionKey} paperwork is invalid.`);
  }
  return config;
}

export async function readAllPaperworkConfigs(): Promise<PaperworkConfig[]> {
  const configs = await collection();
  const stored = await configs.find({}).sort({ _id: 1 }).toArray();
  return stored
    .filter((entry) => validatePaperworkConfig(entry.config).ok)
    .map((entry) => entry.config);
}

export async function readPaperworkDivisionSummaries(): Promise<Pick<PaperworkConfig["division"], "key" | "label" | "icon">[]> {
  const configs = await collection();
  const stored = await configs.find({}, { projection: { "config.division.key": 1, "config.division.label": 1, "config.division.icon": 1 } }).sort({ _id: 1 }).toArray();
  return stored.flatMap(({ config }) =>
    config?.division?.key && config.division.key !== "cru"
      ? [{ key: config.division.key, label: config.division.label, icon: config.division.icon }]
      : [],
  );
}

/** Add empty database workspaces for declared divisions without replacing saved work. */
export async function ensurePaperworkWorkspaces(
  seeds: readonly PaperworkConfig[],
): Promise<string[]> {
  const configs = await collection();
  const inserted: string[] = [];
  for (const seed of seeds) {
    const result = await configs.updateOne(
      { _id: seed.division.key },
      { $setOnInsert: { config: seed } },
      { upsert: true },
    );
    if (result.upsertedCount) inserted.push(seed.division.key);
  }
  return inserted;
}

export async function findPaperworkConfig(
  divisionKey: string,
): Promise<PaperworkConfig | null> {
  const configs = await collection();
  const stored = await configs.findOne({ _id: divisionKey });
  if (!stored) return null;
  const config = stored.config;
  if (!validatePaperworkConfig(config).ok) {
    throw new Error(`Stored ${divisionKey} paperwork is invalid.`);
  }
  return config;
}

export async function writePaperworkConfig(
  config: PaperworkConfig,
): Promise<void> {
  const configs = await collection();
  await configs.updateOne(
    { _id: config.division.key },
    { $set: { config } },
    { upsert: true },
  );
}

/** Sync only source-owned template strings after verifying all other data matches. */
export async function syncCanonicalPaperworkTemplates(
  sources: readonly PaperworkConfig[],
): Promise<{ divisionKey: string; updatedTemplates: number }[]> {
  const configs = await collection();
  const plans: { source: PaperworkConfig; updates: Record<string, string> }[] = [];

  for (const source of sources) {
    const sourceValidation = validatePaperworkConfig(source);
    if (!sourceValidation.ok) {
      throw new Error(`${source.division.key} source is invalid: ${sourceValidation.problems.join("; ")}`);
    }
    const stored = await configs.findOne({ _id: source.division.key });
    if (!stored) throw new Error(`Missing database record for ${source.division.key}.`);
    if (!samePaperworkExceptTemplates(source, stored.config)) {
      throw new Error(`${source.division.key} has non-template differences; no configs were changed.`);
    }
    const updates: Record<string, string> = {};
    collectTemplateUpdates(source, stored.config, "config", updates);
    plans.push({ source, updates });
  }

  const results: { divisionKey: string; updatedTemplates: number }[] = [];
  for (const { source, updates } of plans) {
    if (Object.keys(updates).length) {
      await configs.updateOne({ _id: source.division.key }, { $set: updates });
    }
    results.push({ divisionKey: source.division.key, updatedTemplates: Object.keys(updates).length });
  }
  return results;
}

function samePaperworkExceptTemplates(source: unknown, stored: unknown): boolean {
  if (source === stored) return true;
  if (Array.isArray(source) || Array.isArray(stored)) {
    return Array.isArray(source) && Array.isArray(stored) &&
      source.length === stored.length && source.every((value, index) => samePaperworkExceptTemplates(value, stored[index]));
  }
  if (source && stored && typeof source === "object" && typeof stored === "object") {
    const sourceObject = source as Record<string, unknown>;
    const storedObject = stored as Record<string, unknown>;
    const keys = new Set([...Object.keys(sourceObject), ...Object.keys(storedObject)]);
    for (const key of keys) {
      if (key === "template" || key === "origin") continue;
      if (!samePaperworkExceptTemplates(sourceObject[key], storedObject[key])) return false;
    }
    return true;
  }
  return false;
}

function collectTemplateUpdates(
  source: unknown,
  stored: unknown,
  path: string,
  updates: Record<string, string>,
): void {
  if (Array.isArray(source) && Array.isArray(stored)) {
    source.forEach((value, index) => collectTemplateUpdates(value, stored[index], `${path}.${index}`, updates));
    return;
  }
  if (!source || !stored || typeof source !== "object" || typeof stored !== "object") return;
  const sourceObject = source as Record<string, unknown>;
  const storedObject = stored as Record<string, unknown>;
  if (typeof sourceObject.template === "string" && sourceObject.template !== storedObject.template) {
    updates[`${path}.template`] = sourceObject.template;
  }
  for (const key of Object.keys(sourceObject)) {
    if (key === "template") continue;
    collectTemplateUpdates(sourceObject[key], storedObject[key], `${path}.${key}`, updates);
  }
}

/** AMU compatibility while its route and the Maker use the shared store. */
export { readAMUPaperwork, writeAMUPaperwork };

async function readAMUPaperwork(): Promise<PaperworkConfig> {
  const { default: seed } = await import(
    "@/app/constants/paperwork/generated/amu.json"
  );
  return readPaperworkConfig("amu", seed as PaperworkConfig);
}

async function writeAMUPaperwork(config: PaperworkConfig): Promise<void> {
  return writePaperworkConfig(config);
}

export function hasMongoPaperworkStore(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

export async function closePaperworkStore(): Promise<void> {
  if (!global.paperworkMongo) return;
  const client = await global.paperworkMongo;
  global.paperworkMongo = undefined;
  await client.close();
}
