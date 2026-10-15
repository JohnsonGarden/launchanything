import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
const script=new URL("./install-macos.sh",import.meta.url).pathname;
const src=readFileSync(script,"utf8");
function run(args,env=process.env){ return spawnSync("bash",[script,...args],{encoding:"utf8",env,timeout:20000}); }
function stub({arch="arm64",swift=false}={}){
 const dir=mkdtempSync(resolve(tmpdir(),"la-test-"));mkdirSync(resolve(dir,"bin"));
 for(const [name,body] of Object.entries({
   uname:'if [ "$1" = -s ]; then echo Darwin; else echo '+arch+'; fi',
   xcrun:swift?'echo /Library/Developer/CommandLineTools/usr/bin/swiftc':'exit 1',
   "xcode-select":'echo APPLE_SYSTEM_PROMPT >&2',
   curl:'echo SHOULD_NOT_FETCH >&2; exit 99'
 })) writeFileSync(resolve(dir,"bin",name),"#!/bin/sh\n"+body+"\n",{mode:0o755});
 return {dir,env:{...process.env,HOME:resolve(dir,"home"),PATH:resolve(dir,"bin")+":"+process.env.PATH}};
}
describe("Agent macOS installer contract",()=>{
 it("has valid shell, help and a no-write plan",()=>{
   assert.equal(spawnSync("bash",["-n",script]).status,0);
   assert.match(run(["--help"]).stdout,/--install/);
   assert.match(run(["--plan"]).stderr,/PLAN/);
 });
 it("returns a parseable read-only readiness JSON",()=>{
   const s=stub();try {
     const r=run(["--check","--json"],s.env);
     assert.equal(r.status,0,r.stderr);const j=JSON.parse(r.stdout);
     assert.equal(j.platform,"Darwin");assert.equal(j.architecture,"arm64");
     assert.equal(j.supported,true);assert.equal(j.needsUserAction,true);
   } finally {rmSync(s.dir,{force:true,recursive:true});}
 });
 it("stops safely before downloads when Apple CLT needs user confirmation",()=>{
   const s=stub();try {
     const r=run(["--install","--yes"],s.env);
     assert.equal(r.status,20,r.stderr);assert.match(r.stderr,/USER_ACTION_REQUIRED/);
     assert.match(r.stderr,/APPLE_SYSTEM_PROMPT/);assert.doesNotMatch(r.stderr,/SHOULD_NOT_FETCH/);
   } finally {rmSync(s.dir,{force:true,recursive:true});}
 });
 it("requires agent authorization and Intel preview opt-in",()=>{
   const s=stub({arch:"x86_64"});try {
     assert.equal(run(["--install","--yes"],s.env).status,21);
     assert.equal(run(["--install"],{...s.env,PATH:s.env.PATH}).status,21);
     const j=JSON.parse(run(["--check","--json","--intel-preview"],s.env).stdout);
     assert.equal(j.supported,true);
     assert.equal(run(["--install","--yes","--intel-preview"],s.env).status,20);
   } finally {rmSync(s.dir,{force:true,recursive:true});}
 });
 it("rejects malicious source refs before side effects",()=>{
   for(const ref of ["../../secrets","--evil","main?x=1","https://example.com"]){
     const r=run(["--install","--yes","--ref",ref]);
     assert.equal(r.status,2,ref+" "+r.stderr);assert.match(r.stderr,/INVALID_REF/);
   }
 });
 it("enforces integrity, immutable source, native architecture and rollback",()=>{
   assert.match(src,/shasum -a 256 -c/);
   assert.match(src,/api.github.com\/repos\/\$REPOSITORY\/commits/);
   assert.match(src,/codeload.github.com\/\$REPOSITORY\/tar.gz\/\$commit/);
   assert.match(src,/lipo.*-verify_arch/);
   assert.match(src,/~/);assert.match(src,/Applications/);
   assert.match(src,/BACKUP_FAILED|INSTALL_FAILED/);
   assert.doesNotMatch(src,/^\s*(?:sudo|xattr|spctl|networksetup)\s/m);
 });
});