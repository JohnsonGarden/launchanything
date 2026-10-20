// Convert two Tauri-signed macOS update bundles into the static manifest
// expected by the official updater. Run only after both architectures build.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
if (!dir) throw new Error("Usage: node scripts/build-updater-manifest.mjs <release-assets-directory>");

const version = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
const tag = "v" + version;
const platforms = {};
for (const [arch, target] of [["arm64", "darwin-aarch64"], ["x86_64", "darwin-x86_64"]]) {
  const filename = "LaunchAnything_" + tag + "_macos_" + arch + ".app.tar.gz";
  const archive = join(dir, filename);
  const signatureFile = archive + ".sig";
  if (!existsSync(archive) || !existsSync(signatureFile)) {
    throw new Error("Missing signed update pair: " + filename);
  }
  const signature = readFileSync(signatureFile, "utf8").trim();
  if (!signature) throw new Error("Empty signature for " + filename);
  platforms[target] = {
    url: "https://github.com/JohnsonGarden/launchanything/releases/download/" +
      tag + "/" + filename,
    signature,
  };
}
const manifest = {
  version,
  notes: "See GitHub Releases for details.",
  pub_date: new Date().toISOString(),
  platforms,
};
writeFileSync(join(dir, "updater.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("Built two-platform Tauri signed updater manifest for " + tag);
