import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

function setup() {
  class Node {
    constructor(tagName, text = "") { this.tagName = tagName; this.children = []; this.text = text; }
    set textContent(value) { this.text = value; this.children = []; }
    get textContent() { return this.text + this.children.map((child) => child.textContent).join(""); }
    append(...children) { this.children.push(...children); }
  }
  const document = { createElement: (tag) => new Node(tag), createTextNode: (text) => new Node("#text", text) };
  const window = {};
  vm.runInNewContext(readFileSync(new URL("../public/post-format.js", import.meta.url), "utf8"), { document, window });
  return window.PakHubPostFormat.render;
}

function find(root, tag) {
  return [root, ...root.children.flatMap((child) => find(child, tag))].filter((node) => node.tagName === tag);
}

test("original message formatting renders emphasis, lists, quotes and code", () => {
  const render = setup();
  const result = render("**Why?** Keep *these words*.\n\n- Normal version\n- Golden version\n\n> Author's note\n\n```\n\n<original code>\n```");
  assert.equal(find(result, "strong")[0].textContent, "Why?");
  assert.equal(find(result, "em")[0].textContent, "these words");
  assert.deepEqual(find(result, "li").map((node) => node.textContent), ["Normal version", "Golden version"]);
  assert.equal(find(result, "blockquote")[0].textContent, "Author's note");
  assert.equal(find(result, "pre")[0].textContent, "\n<original code>");
});

test("source HTML and unsafe Markdown links remain inert text", () => {
  const result = setup()('<img src=x onerror=alert(1)> <script>alert(1)</script> [bad](javascript:alert(1)) [data](data:text/html,test)');
  assert.equal(find(result, "img").length + find(result, "script").length + find(result, "a").length, 0);
  assert.ok(result.textContent.includes("<script>alert(1)</script>"));
  assert.ok(result.textContent.includes("javascript:alert(1)"));
});

test("mod identifiers and filenames retain their literal underscores", () => {
  const source = "ENE_LootBug_Gold and LootSansSummerName_WithGoldenSans.pak; _emphasis_ stays formatted.";
  const result = setup()(source);
  assert.ok(result.textContent.includes("ENE_LootBug_Gold and LootSansSummerName_WithGoldenSans.pak"));
  assert.equal(find(result, "em")[0].textContent, "emphasis");
});

test("web links remain distinct actions and trailing sentence punctuation is preserved", () => {
  const result = setup()("[Original mod](https://mod.io/g/drg/m/mod) and https://example.com/test.");
  const links = find(result, "a");
  assert.equal(links.length, 2);
  assert.equal(links[0].textContent, "Original mod");
  assert.equal(links[1].href, "https://example.com/test");
  assert.ok(links.every((link) => link.target === "_blank" && link.rel === "noopener noreferrer"));
  assert.ok(result.textContent.endsWith("test."));
});
