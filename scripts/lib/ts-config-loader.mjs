/**
 * Registers `ts-config-hooks.mjs`, which lets the scripts under `scripts/`
 * import the app's own config through the `@/` alias.
 *
 * Reports built on the real config can't drift from what the app enforces,
 * which is the whole point of having them: the route report reads
 * `ROUTE_ACCESS` itself rather than a copy of it.
 *
 * Usage (Node strips the TypeScript types on its own):
 *
 *   node --import ./scripts/lib/ts-config-loader.mjs scripts/routes-report.ts
 */
import { register } from "node:module";

register("./ts-config-hooks.mjs", import.meta.url);
