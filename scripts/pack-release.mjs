import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const packageJson = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
const stagingDir = join(packageRoot, ".release-staging");
const releaseDir = join(packageRoot, "releases");
const smokeDir = mkdtempSync(join(tmpdir(), "lengend-nightmare-engine-"));

try {
  rmSync(stagingDir, { force: true, recursive: true });
  mkdirSync(stagingDir, { recursive: true });
  mkdirSync(releaseDir, { recursive: true });

  execFileSync("pnpm", ["pack", "--pack-destination", stagingDir], {
    cwd: packageRoot,
    stdio: "inherit",
  });

  const archive = readdirSync(stagingDir).find((name) => name.endsWith(".tgz"));
  if (!archive) {
    throw new Error("pnpm pack did not create a tarball");
  }

  const packedArchive = join(stagingDir, archive);
  const target = join(releaseDir, `lengend-nightmare-engine-${packageJson.version}.tgz`);
  copyFileSync(packedArchive, target);

  execFileSync("tar", ["-xzf", packedArchive, "-C", smokeDir]);
  const installedPackage = join(smokeDir, "package");
  execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      `const engine = await import(${JSON.stringify(pathToFileURL(join(installedPackage, "dist/index.js")).href)}); if (typeof engine.createTurnBasedEngine !== "function") throw new Error("Packed engine entry point is invalid");`,
    ],
    { stdio: "inherit" },
  );

  if (!existsSync(target)) {
    throw new Error(`Release archive was not written to ${target}`);
  }

  const checksum = createHash("sha256").update(readFileSync(target)).digest("hex");
  writeFileSync(`${target}.sha256`, `${checksum}  ${target.split("/").at(-1)}\n`);

  console.log(`Release archive written and smoke-tested: ${target}`);
} finally {
  rmSync(stagingDir, { force: true, recursive: true });
  rmSync(smokeDir, { force: true, recursive: true });
}