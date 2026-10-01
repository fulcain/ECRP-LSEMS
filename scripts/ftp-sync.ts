#!/usr/bin/env node
/**
 * Assembles the FTP's sections into the module the app reads the profile from.
 *
 * A publish runs this itself on a checkout that can write. It is a command of its
 * own because the deployed app cannot write anything: there a member applies a
 * published section to the repository by hand, and this is what puts the profile
 * the contract workflow hands out back in step with it.
 *
 *   npm run ftp:sync
 */

import { writeFileSync } from "node:fs";
import path from "node:path";

import {
  FTP_CONTENT_MODULE,
  renderFtpContentModule,
} from "@/lib/ftp";

renderFtpContentModule().then((text) => {
  writeFileSync(path.join(process.cwd(), FTP_CONTENT_MODULE), text, "utf8");
  console.log(`wrote ${FTP_CONTENT_MODULE}`);
});
