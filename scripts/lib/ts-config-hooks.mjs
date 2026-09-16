/**
 * The module-resolution hook itself: it maps the app's `@/` alias onto
 * `src/`, so a script can import config exactly as the app does.
 *
 * Registered by `ts-config-loader.mjs` - import that one, not this one.
 * Node strips the TypeScript types on its own, so no build step is involved.
 */
import { statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const srcDir = path.resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "..",
  "..",
  "src",
);

// The extensions a bare alias may resolve to, in resolution order.
const CANDIDATES = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];

/**
 * A candidate only counts if it is a *file* - `@/app/constants/divisions` is a
 * directory, and `exists` would happily return that directory itself as the
 * match and then fail to read it. The `/index.ts` candidate is what resolves
 * those.
 */
function isFile(candidate) {
  try {
    return statSync(candidate).isFile();
  } catch {
    return false;
  }
}

function resolveAlias(specifier) {
  const target = path.join(srcDir, specifier.slice(2));
  for (const suffix of CANDIDATES) {
    const candidate = `${target}${suffix}`;
    if (isFile(candidate)) return pathToFileURL(candidate).href;
  }
  return null;
}

/** The `@/` alias first, then the app's extensionless relative imports. */
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const url = resolveAlias(specifier);
    if (url) return { url, shortCircuit: true };
  }

  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    // TypeScript lets a module import `./amu` where Node's ESM resolver
    // demands the extension: the app's `src` is written for a bundler, so a
    // script reaching into it has to supply the same candidates the alias
    // branch does. Only bare relative specifiers are retried, and only when
    // node couldn't resolve them - a real miss still fails as a real miss.
    if (
      context.parentURL &&
      (specifier.startsWith("./") || specifier.startsWith("../"))
    ) {
      const base = path.resolve(
        path.dirname(fileURLToPath(context.parentURL)),
        specifier,
      );
      for (const suffix of CANDIDATES) {
        const candidate = `${base}${suffix}`;
        if (isFile(candidate)) return { url: pathToFileURL(candidate).href, shortCircuit: true };
      }
    }
    throw error;
  }
}
