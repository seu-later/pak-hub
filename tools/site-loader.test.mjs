import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pages = ["index.html", "dump.html", "dependencies.html", "about.html"].map((page) =>
  readFileSync(new URL(`../public/${page}`, import.meta.url), "utf8"));
const motion = readFileSync(new URL("../public/site-motion.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");

test("the loading screen is removed from every page and its runtime styles", () => {
  for (const page of pages) assert.doesNotMatch(page, /site-loader|Loading Pak Hub/);
  assert.doesNotMatch(motion, /site-loader|site-loading/);
  assert.doesNotMatch(styles, /\.site-loader|loader-caret/);
});
