import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const workspaceRoot = resolve(packageRoot, "../..");
const packageJson = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
const version = packageJson.version;
const tag = `v${version}`;
const repositoryUrl = packageJson.repository.url.replace(/\.git$/, "");
const archiveName = `lengend-nightmare-engine-${version}.tgz`;
const archiveUrl = `${repositoryUrl}/raw/${tag}/releases/${archiveName}`;
const checkOnly = process.argv.includes("--check");

if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error(`Package version is not a valid release version: ${version}`);
}

const changelogPath = join(packageRoot, "CHANGELOG.md");
const changelog = readFileSync(changelogPath, "utf8");
const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const sectionMatch = changelog.match(
  new RegExp(`^## \\[${escapedVersion}\\][^\\n]*\\n([\\s\\S]*?)(?=^## \\[|(?![\\s\\S]))`, "m"),
);
if (!sectionMatch) {
  throw new Error(`CHANGELOG.md needs a section for ${version}`);
}

const releaseNotes = `# Lengend Nightmare Engine ${tag}\n\n${sectionMatch[1].trim()}\n`;
const notesPath = join(packageRoot, "releases", `lengend-nightmare-engine-${version}.md`);
const readmePath = join(packageRoot, "README.md");
const sitePath = join(workspaceRoot, "artifacts/lengend-nightmare-engine-site/src/App.tsx");

const updates = new Map();
updates.set(
  readmePath,
  readFileSync(readmePath, "utf8")
    .replace(/Install the versioned [^:]+ archive with one command:/, "Install the current versioned archive with one command:")
    .replace(
      /pnpm add https:\/\/github\.com\/acccount1982-star\/engine\/raw\/v[^/]+\/releases\/lengend-nightmare-engine-[^\s]+\.tgz/,
      `pnpm add ${archiveUrl}`,
    ),
);
if (existsSync(sitePath)) {
  updates.set(
    sitePath,
    readFileSync(sitePath, "utf8")
      .replace(/const ENGINE_VERSION = "[^"]+";/, `const ENGINE_VERSION = "${version}";`)
      .replace(/const RELEASE_URL = .*;/, "const RELEASE_URL = `${REPO_URL}/raw/v${ENGINE_VERSION}/releases/lengend-nightmare-engine-${ENGINE_VERSION}.tgz`;")
      .replace(/const LICENSE_URL = .*;/, "const LICENSE_URL = `${REPO_URL}/blob/v${ENGINE_VERSION}/LICENSE`;")
      .replace(/VERSION (?:[^ ]+|\{ENGINE_VERSION\}|\$\{ENGINE_VERSION\}) \/ OPEN CORE/, "VERSION {ENGINE_VERSION} / OPEN CORE"),
  );
}
updates.set(notesPath, releaseNotes);

const staleFiles = [...updates].filter(([path, expected]) => {
  try {
    return readFileSync(path, "utf8") !== expected;
  } catch {
    return true;
  }
});

if (checkOnly && staleFiles.length > 0) {
  throw new Error(`Release metadata is stale: ${staleFiles.map(([path]) => path.slice(workspaceRoot.length + 1)).join(", ")}`);
}

if (!checkOnly) {
  for (const [path, content] of staleFiles) {
    writeFileSync(path, content);
  }
}

console.log(`${checkOnly ? "Checked" : "Prepared"} release ${tag}`);