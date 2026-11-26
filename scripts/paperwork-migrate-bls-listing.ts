import { MongoClient } from "mongodb";

import source from "@/app/constants/paperwork/generated/bls.json" with { type: "json" };
import { validatePaperworkConfig, type PaperworkConfig } from "@/lib/paperwork/schema";

function sameExceptListing(sourceConfig: PaperworkConfig, stored: PaperworkConfig): boolean {
  const sourceCopy = structuredClone(sourceConfig) as PaperworkConfig & { origin?: string };
  const storedCopy = structuredClone(stored) as PaperworkConfig & { origin?: string };
  delete sourceCopy.origin;
  delete storedCopy.origin;
  const sourceListing = sourceCopy.division.pages[0]?.groups[2]?.formats[0];
  const storedListing = storedCopy.division.pages[0]?.groups[2]?.formats[0];
  if (sourceListing?.key !== "courseListing" || storedListing?.key !== "courseListing") return false;
  sourceCopy.division.pages[0].groups[2].formats[0] = storedListing;
  return JSON.stringify(sourceCopy) === JSON.stringify(storedCopy);
}

const next = source as PaperworkConfig;
const validation = validatePaperworkConfig(next);
if (!validation.ok) throw new Error(validation.problems.join("; "));
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not configured.");

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8_000 });
try {
  await client.connect();
  const configs = client.db("ecrp_lsems").collection<{ _id: string; config: PaperworkConfig }>("paperwork_configs");
  const stored = await configs.findOne({ _id: "bls" });
  if (!stored || !sameExceptListing(next, stored.config)) {
    throw new Error("BLS contains changes outside the course listing; no database value was written.");
  }
  const oldListing = stored.config.division.pages[0]?.groups[2]?.formats[0];
  const newListing = next.division.pages[0]?.groups[2]?.formats[0];
  if (oldListing?.key !== "courseListing" || newListing?.key !== "courseListing") {
    throw new Error("BLS listing identifiers or ordering changed; no database value was written.");
  }
  const result = await configs.updateOne(
    { _id: "bls", "config.division.pages.0.groups.2.formats.0": oldListing },
    { $set: { "config.division.pages.0.groups.2.formats.0": newListing } },
  );
  if (result.modifiedCount !== 1) throw new Error("The BLS listing changed during migration; nothing was updated.");
  console.log("Updated only the BLS course listing in the main paperwork record.");
} finally {
  await client.close();
}
