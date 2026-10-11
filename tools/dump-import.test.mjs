import test from "node:test";
import assert from "node:assert/strict";
import { groupDumpFiles } from "./dump-import.mjs";

const get = (map, name) => {
  const entry = map.get(name);
  assert.ok(entry, `missing group entry for ${name}`);
  return entry;
};

test("explicit version markers group without sibling evidence", () => {
  const grouped = groupDumpFiles([
    "Anti-Asthma_v2",
    "Anti-Asthma_v6",
    "Anti-Lung_Cancer_v2",
    "Biomes_Evolution_v139",
    "BetterRevolverV2.5_P",
    "BP_Mod_Manager_-_V4.3__P",
    "Alternative_Boomstick_-_V1__P",
    "010_BDB_CrassusEdition__1_0_0",
    "clutterbegone_23.01.30_patch",
    "custom-difficulty2-beta-10",
    "custom-difficulty2-beta-13",
    "custom-difficulty2-update-14-rc1",
    "MinimalDotty_beta1",
    "MinimalDotty_beta2",
  ]);

  assert.deepEqual([get(grouped, "Anti-Asthma_v6").base, get(grouped, "Anti-Asthma_v6").version], ["Anti-Asthma", "6"]);
  assert.deepEqual([get(grouped, "Biomes_Evolution_v139").base, get(grouped, "Biomes_Evolution_v139").version], ["Biomes_Evolution", "139"]);
  assert.deepEqual([get(grouped, "BetterRevolverV2.5_P").base, get(grouped, "BetterRevolverV2.5_P").version], ["BetterRevolver", "2.5"]);
  assert.deepEqual([get(grouped, "BP_Mod_Manager_-_V4.3__P").base, get(grouped, "BP_Mod_Manager_-_V4.3__P").version], ["BP_Mod_Manager", "4.3"]);
  assert.deepEqual([get(grouped, "Alternative_Boomstick_-_V1__P").base, get(grouped, "Alternative_Boomstick_-_V1__P").version], ["Alternative_Boomstick", "1"]);
  assert.deepEqual(
    [get(grouped, "010_BDB_CrassusEdition__1_0_0").base, get(grouped, "010_BDB_CrassusEdition__1_0_0").version],
    ["010_BDB_CrassusEdition", "1_0_0"],
  );
  assert.deepEqual(
    [get(grouped, "clutterbegone_23.01.30_patch").base, get(grouped, "clutterbegone_23.01.30_patch").version],
    ["clutterbegone", "23.01.30"],
  );
  const beta = get(grouped, "custom-difficulty2-beta-10");
  assert.equal(beta.base, "custom-difficulty2");
  assert.equal(beta.version, "beta-10");
  assert.equal(beta.prerelease, 1);
  assert.equal(get(grouped, "custom-difficulty2-update-14-rc1").prerelease, 1);
  assert.equal(get(grouped, "MinimalDotty_beta2").version, "beta-2");
});

test("bare trailing numbers need sibling or series evidence", () => {
  const grouped = groupDumpFiles([
    "balance161", "balance162", "balance163", "balance174",
    "cave24", "cave45", "cave46", "cave47", "cave48",
    "AlwaysAllowHaz5", "AlwaysAllowHaz5_3",
    "AlwaysSprint_P_2",
    "Cull4", "A1toB7", "custom-difficulty2", "FingerGunBulldog_P",
  ]);

  assert.deepEqual([get(grouped, "balance174").base, get(grouped, "balance174").version], ["balance", "174"]);
  assert.deepEqual([get(grouped, "cave48").base, get(grouped, "cave48").version], ["cave", "48"]);
  assert.deepEqual([get(grouped, "AlwaysAllowHaz5_3").base, get(grouped, "AlwaysAllowHaz5_3").version], ["AlwaysAllowHaz5", "3"]);
  assert.equal(get(grouped, "AlwaysAllowHaz5").version, "");
  for (const whole of ["Cull4", "A1toB7", "custom-difficulty2", "FingerGunBulldog_P", "AlwaysSprint_P_2"]) {
    assert.equal(get(grouped, whole).base, whole);
    assert.equal(get(grouped, whole).version, "");
  }
});

test("windows duplicate markers collapse to the same stem", () => {
  const grouped = groupDumpFiles(["FingerGunBulldog_P (1)", "FingerGunBulldog_P (2)", "FingerGunBulldog_P"]);
  for (const name of ["FingerGunBulldog_P (1)", "FingerGunBulldog_P (2)", "FingerGunBulldog_P"]) {
    assert.equal(get(grouped, name).base, "FingerGunBulldog_P");
  }
});
