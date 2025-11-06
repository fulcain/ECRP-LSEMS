#!/usr/bin/env node
import { execSync } from "node:child_process";
import readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const choices = ["patch", "minor", "major"];

console.log("\n Choose your release type:");
choices.forEach((t, i) => console.log(`  ${i + 1}) ${t}`));

rl.question("\nSelect a number: ", (input) => {
  const index = parseInt(input) - 1;
  const type = choices[index];

  if (!type) {
    console.error("\nInvalid choice, aborting.");
    rl.close();
    process.exit(1);
  }

  console.log(
    `\n👉 Running: npm version ${type} && git push && git push --tags\n`,
  );
  try {
    execSync(`npm version ${type}`, { stdio: "inherit" });
    execSync("git push", { stdio: "inherit" });
    execSync("git push --tags", { stdio: "inherit" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Something went wrong:", err.message);
    } else {
      console.error("❌ Unknown error:", err);
    }
  } finally {
    rl.close();
  }
});
