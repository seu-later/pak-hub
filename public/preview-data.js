(() => {
  const params = new URLSearchParams(location.search);
  const local = location.protocol === "file:" || ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
  if (params.get("demo") !== "1" && (!local || params.get("demo") === "0")) return;
  const requested = Number(params.get("stress"));
  const stress = [100, 500, 1000].includes(requested) ? requested : 0;
  const groups = [
    { name: "Shield and C4 count", postedAt: "2026-10-08T15:20:00.000Z", description: "Displays your teammates’ shield and C4 counts. Counter position, scale, color, and opacity can be customized.", fileCount: 2, files: [{ filename: "shieldc4countV2.pak", version: "2", prerelease: false }, { filename: "shieldc4count.pak", version: "1", prerelease: false }] },
    { name: "Revolver sound replacement", postedAt: "2026-10-08T15:12:00.000Z", description: "Revolver sound replacement with FAMAS shooting sfx.", fileCount: 2, files: [{ filename: "revolverSoundV2.pak", version: "2", prerelease: false }, { filename: "revolverSound.pak", version: "1", prerelease: false }] },
  ];
  let mods = null;
  if (stress) {
    mods = Array.from({ length: stress }, (_, index) => {
      const number = String(index + 1).padStart(4, "0");
      const long = index % 9 === 0;
      const name = long ? `Preview pak ${number} — an intentionally long catalogue title for responsive layout checks` : `Preview pak ${number}`;
      const description = `Synthetic preview entry ${number}. This is layout data, not a downloadable mod.\n\n${long ? "A long description checks wrapping, reading measure, and independent panel scrolling. ".repeat(18) : "Synthetic pak description."}`;
      const files = Array.from({ length: index % 7 === 0 ? 12 : 2 }, (_, version) => ({ filename: `preview_${number}_${version + 1}${long ? "_a_long_filename_that_must_wrap_without_covering_the_download_control" : ""}.pak`, sizeBytes: 1024 * (index + 1), downloadUrl: "", version: String(version + 1), prerelease: false }));
      const postedAt = new Date(Date.UTC(2026, 9, 1, 0, index)).toISOString();
      const mod = { slug: `preview-${number}`, name, postedBy: "preview", postedAt, fileCount: files.length, threadFileCount: 0, initialPost: { postedBy: "preview", postedAt, content: description, sourceUrl: "", files }, threadPosts: [] };
      groups[index] = { name, postedAt, description, fileCount: files.length, files };
      return mod;
    });
  }
  window.PakHubPreview = { groups, mods, stress };
  document.title += stress ? ` [Stress preview: ${stress}]` : " [Preview]";
})();
