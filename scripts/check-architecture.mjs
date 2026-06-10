import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const MAX_LINES = 200;
const LINE_LIMIT_DIRS = [
  "app",
  "components",
  "features",
  "lib",
  "shared",
  "database",
];
const CODE_EXTENSIONS = new Set([
  ".css",
  ".js",
  ".jsx",
  ".mjs",
  ".sql",
  ".ts",
  ".tsx",
]);
const IGNORED_PARTS = new Set([".git", ".next", "node_modules"]);

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;

  for (const entry of readdirSync(dir)) {
    if (IGNORED_PARTS.has(entry)) continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function extensionOf(path) {
  const match = path.match(/\.[^.]+$/);
  return match?.[0] ?? "";
}

function projectPath(path) {
  return relative(ROOT, path);
}

function countLines(path) {
  const text = readFileSync(path, "utf8");
  if (text.length === 0) return 0;
  return text.replace(/\r?\n$/, "").split(/\r?\n/).length;
}

function fail(message) {
  failures.push(message);
}

const failures = [];

for (const dir of LINE_LIMIT_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    if (!CODE_EXTENSIONS.has(extensionOf(file))) continue;
    const lines = countLines(file);
    if (lines > MAX_LINES) {
      fail(`${projectPath(file)} tem ${lines} linhas (limite ${MAX_LINES})`);
    }
  }
}

for (const file of walk(join(ROOT, "lib"))) {
  if (![".ts", ".tsx"].includes(extensionOf(file))) continue;
  const text = readFileSync(file, "utf8");
  if (text.includes("@/features/")) {
    fail(`${projectPath(file)} importa "@/features/*" a partir de lib`);
  }
}

if (existsSync(join(ROOT, "middleware.ts"))) {
  fail("middleware.ts existe; use proxy.ts no Next 16");
}

for (const dir of ["app", "components", "features", "lib", "shared"]) {
  for (const file of walk(join(ROOT, dir))) {
    if (projectPath(file).includes("/legacy/")) {
      fail(`${projectPath(file)} está dentro de pasta legacy`);
    }
  }
}

if (failures.length > 0) {
  console.error("Falhas de arquitetura:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Arquitetura OK.");
