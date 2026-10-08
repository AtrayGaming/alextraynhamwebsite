import { readFileSync, writeFileSync } from "node:fs";

// OpenNext 1.20.9 omits Next 16.4's preview-props.json from its inlined
// manifests. Track upstream opennextjs/opennextjs-cloudflare#1356; remove
// this narrow compatibility patch when upgrading to a release containing it.
const root = "node_modules/@opennextjs/cloudflare/";
const version = JSON.parse(readFileSync(root + "package.json", "utf8")).version;
if (version !== "1.20.9") throw Error("Review OpenNext compatibility patch before upgrading");
const path = root + "dist/cli/build/patches/plugins/load-manifest.js";
const original = "{*-manifest,required-server-files,prefetch-hints}.json";
const replacement = "{*-manifest,required-server-files,prefetch-hints,preview-props}.json";
const source = readFileSync(path, "utf8");
if (source.includes(original)) writeFileSync(path, source.replace(original, replacement));
else if (!source.includes(replacement)) throw Error("OpenNext manifest patch target changed");
