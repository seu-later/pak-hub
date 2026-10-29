import test from "node:test";
import assert from "node:assert/strict";
import { parseSearch, matchesSearch, searchRank } from "../public/search.js";
import { snapshotResponse } from "../functions/_lib/catalog-snapshot.js";

test("real archive naming patterns remain searchable without weakening punctuation", () => {
  for (const [query, name] of [
    ["unified weapon balance", "Unified_Weapon_Balance"],
    ["custom cave layouts", "CustomCaveLayouts43.pak"],
    ["anti asthma", "Anti-Asthma"],
    ["iron will status client events", "IronWillStatus_ClientEvents"],
    ["biome recolour", "SaltPits_Biome_Recolour"],
    ["更多敌人 简化模型", "U39更多敌人简化模型"],
  ]) assert.ok(matchesSearch(parseSearch(query), [], [name]), `${query} -> ${name}`);
  assert.equal(matchesSearch(parseSearch("miner_x"), ["miner x"]), false);
  assert.equal(matchesSearch(parseSearch("red"), ["are dark"]), false);
  assert.equal(matchesSearch(parseSearch("1.2"), [], ["Mod_v12"]), false);
  assert.equal(matchesSearch(parseSearch('"Unified_Weapon_Balance"'), [], ["UnifiedWeaponBalance"]), false);
  assert.equal(matchesSearch(parseSearch('"Weapon_Balance" unified'), [], ["Unified_Weapon_Balance"]), true);
  assert.equal(matchesSearch(parseSearch("unified missing"), [], ["Unified_Weapon_Balance"]), false);
  assert.equal(matchesSearch(parseSearch("100%"), [], ["100X"]), false);
});

test("rank favors literal titles, formatted titles, titles in any order, then filenames", () => {
  const query = parseSearch("unified weapon balance");
  assert.deepEqual([
    searchRank(query, "Unified Weapon Balance"),
    searchRank(query, "Unified Weapon Balance Extended"),
    searchRank(query, "Unified_Weapon_Balance"),
    searchRank(query, "BalanceWeaponUnified"),
    searchRank(query, "Different name", ["Unified_Weapon_Balance.pak"]),
    searchRank(query, "Different name"),
  ], [0, 1, 2, 3, 4, 5]);
});

test("local recovery catalog finds the requested real mod without correcting typos", async () => {
  for (const q of ["unified weapon balance", "balance weapon unified", '"Unified_Weapon_Balance"']) {
    const data = await snapshotResponse(new Request(`https://example.com/api/dump?${new URLSearchParams({ q })}`)).json();
    assert.ok(data.groups.some((group) => group.name === "Unified_Weapon_Balance"));
  }
  const data = await snapshotResponse(new Request("https://example.com/api/dump?q=unifed+weapon+balance")).json();
  assert.equal(data.total, 0);
  assert.equal("suggestions" in data, false);
});
