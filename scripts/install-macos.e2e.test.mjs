import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const installer = new URL("./install-macos.sh", import.meta.url).pathname;
const sha = "a".repeat(40);
function stub(bin, name, body) {
  writeFileSync(join(bin,name), "#!/bin/sh\n" + body + "\n", {mode:0o755});
}
function fixture() {
  const root=mkdtempSync(join(tmpdir(),"la-source-install-"));
  const home=join(root,"home"), tmp=join(root,"tmp"), bin=join(root,"bin");
  const project=join(root,"fixture","source");
  for(const folder of [home,tmp,bin,join(project,"src-tauri")]) mkdirSync(folder,{recursive:true});
  writeFileSync(join(project,"package.json"), JSON.stringify({scripts:{build:"stub"}}));
  writeFileSync(join(project,"src-tauri","tauri.conf.json"), '{"version":"0.1.0"}');
  const archive=join(root,"source.tar.gz");
  const packed=spawnSync("tar",["-czf",archive,"-C",join(root,"fixture"),"source"],{encoding:"utf8"});
  assert.equal(packed.status,0,packed.stderr);

  stub(bin,"uname",'if [ "$1" = -s ]; then echo Darwin; else echo arm64; fi');
  stub(bin,"xcrun",[
    'if [ "$1" = --find ]; then echo /usr/bin/swiftc; exit 0; fi',
    'if [ "$1" = lipo ]; then exit 0; fi',
    'exit 5',
  ].join("\n"));
  stub(bin,"cargo",'echo "cargo 1.90.0"');
  stub(bin,"rustc",'echo "rustc 1.90.0"');
  stub(bin,"pgrep",'exit 1');
  stub(bin,"ditto",'mkdir -p "$2"\ncp -R "$1"/. "$2"/');
  stub(bin,"npm",[
    'if [ "$1" = install ]; then exit 0; fi',
    'if [ "$1" = run ] && [ "$2" = build ]; then',
    '  base="src-tauri/target/release/bundle/macos/LaunchAnything.app/Contents"',
    '  mkdir -p "$base/MacOS" "$base/Resources/bin"',
    '  touch "$base/MacOS/launchanything" "$base/Resources/bin/launchanything-macos-helper"',
    '  exit 0',
    'fi',
    'exit 9',
  ].join("\n"));
  stub(bin,"curl",[
    'output=""; url=""; prev=""',
    'for value in "$@"; do',
    '  if [ "$prev" = --output ]; then output="$value"; fi',
    '  case "$value" in https://*) url="$value";; esac',
    '  prev="$value"',
    'done',
    'case "$url" in',
    '  https://api.github.com/*) printf \u0027{"sha":"%s"}\\n\u0027 "$TEST_SHA" > "$output";;',
    '  https://codeload.github.com/*) cp "$TEST_ARCHIVE" "$output";;',
    '  *) echo "UNEXPECTED_EXTERNAL_URL: $url" >&2; exit 98;;',
    'esac',
  ].join("\n"));
  return {root,home,env:{...process.env,HOME:home,TMPDIR:tmp,PATH:bin+":"+process.env.PATH,TEST_ARCHIVE:archive,TEST_SHA:sha}};
}
describe("complete Agent bootstrap path without actual network/privilege changes",()=>{
  it("installs and verifies APP, records immutable SHA, preserves settings and backs up on retry",()=>{
    const {root,home,env}=fixture();
    try {
      const settingsDir=join(home,"Library","Application Support","LaunchAnything");
      mkdirSync(settingsDir,{recursive:true});
      writeFileSync(join(settingsDir,"settings.json"),'{"proxyPort":10808}');
      const run=()=>spawnSync("bash",[installer,"--install","--yes","--no-launch"],{env,encoding:"utf8",timeout:20000});
      const first=run();
      assert.equal(first.status,0,first.stderr);
      assert.match(first.stderr,/SUCCESS\[INSTALLED\]/);
      const apps=join(home,"Applications"),contents=join(apps,"LaunchAnything.app","Contents");
      assert.equal(existsSync(join(contents,"MacOS","launchanything")),true);
      assert.equal(existsSync(join(contents,"Resources","bin","launchanything-macos-helper")),true);
      const receipt=readFileSync(join(settingsDir,"installer","install-receipt.txt"),"utf8");
      assert.ok(receipt.includes("commit="+sha));
      const second=run();
      assert.equal(second.status,0,second.stderr);
      assert.match(second.stderr,/Previous app backup/);
      assert.ok(readdirSync(apps).some(x=>x.startsWith("LaunchAnything.backup.")&&x.endsWith(".app")));
      assert.equal(readFileSync(join(settingsDir,"settings.json"),"utf8"),'{"proxyPort":10808}');
    } finally {rmSync(root,{recursive:true,force:true});}
  });
});
