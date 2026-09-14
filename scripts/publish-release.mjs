import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const packageJson = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
const version = packageJson.version;
const tag = `v${version}`;
const archiveBase = `releases/lengend-nightmare-engine-${version}`;
const notesPath = `${archiveBase}.md`;

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: packageRoot,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  })?.trim();
}

run("git", ["rev-parse", "--is-inside-work-tree"]);
run("gh", ["--version"]);

const branch = run("git", ["branch", "--show-current"], { capture: true });
if (!branch) {
  throw new Error("Release publishing requires a checked-out branch");
}

run("git", [
  "add",
  "README.md",
  "-f",
  `${archiveBase}.tgz`,
  `${archiveBase}.tgz.sha256`,
  notesPath,
]);

const hasGeneratedChanges = (() => {
  try {
    run("git", ["diff", "--cached", "--quiet"]);
    return false;
  } catch {
    return true;
  }
})();

if (hasGeneratedChanges) {
  run("git", ["commit", "-m", `Publish Lengend Nightmare Engine ${tag}`]);
}

run("git", ["tag", "--force", tag]);
run("git", ["push", "origin", `HEAD:${branch}`]);
run("git", ["push", "origin", "--force", `refs/tags/${tag}`]);

let releaseExists = true;
try {
  run("gh", ["release", "view", tag], { capture: true });
} catch {
  releaseExists = false;
}

if (releaseExists) {
  run("gh", ["release", "edit", tag, "--title", `Lengend Nightmare Engine ${tag}`, "--notes-file", notesPath, "--latest"]);
} else {
  run("gh", ["release", "create", tag, "--title", `Lengend Nightmare Engine ${tag}`, "--notes-file", notesPath, "--latest"]);
}

console.log(`Published ${tag} from ${branch}`);