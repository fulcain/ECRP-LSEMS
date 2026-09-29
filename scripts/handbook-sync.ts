#!/usr/bin/env node
/**
 * Assembles the handbook's sections into the module the app reads the profile from.
 *
 * A publish runs this itself on a checkout that can write. It is a command of its
 * own because the deployed app cannot write anything: there a member applies a
 * published section to the repository by hand, and this is what puts the profile
 * the contract workflow hands out back in step with it.
 *
 *   npm run handbook:sync
 */

import { writeFileSync } from "node:fs";
import path from "node:path";

import {
  HANDBOOK_CONTENT_MODULE,
  renderHandbookContentModule,
} from "@/lib/handbook";

renderHandbookContentModule().then((text) => {
  writeFileSync(path.join(process.cwd(), HANDBOOK_CONTENT_MODULE), text, "utf8");
  console.log(`wrote ${HANDBOOK_CONTENT_MODULE}`);
});
