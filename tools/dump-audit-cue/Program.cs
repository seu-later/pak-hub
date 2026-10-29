using CUE4Parse.UE4.Pak;
using CUE4Parse.UE4.Versions;
using System.Text.Json;

try {
if (args.Length != 2) throw new ArgumentException("Expected package path and output directory");
CUE4Parse.Compression.ZlibHelper.Initialize(Path.GetFullPath(".dump-audit/zlib-ng2.dll"));
var output = Path.GetFullPath(args[1]);
Directory.CreateDirectory(output);
using var reader = new PakFileReader(args[0], new VersionContainer(EGame.GAME_UE4_25));
reader.Mount(StringComparer.OrdinalIgnoreCase);
var paths = new List<string>();
foreach (var item in reader.Files) {
    var target = Path.GetFullPath(Path.Combine(output, item.Key.Replace('/', Path.DirectorySeparatorChar)));
    if (!target.StartsWith(output + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)) throw new IOException("Unsafe package member path");
    Directory.CreateDirectory(Path.GetDirectoryName(target)!);
    File.WriteAllBytes(target, item.Value.Read());
    paths.Add(item.Key);
}
File.WriteAllText(Path.Combine(output, "cue-inventory.json"), JsonSerializer.Serialize(paths));
Console.WriteLine($"Extracted {paths.Count} files");

} catch (Exception error) { Console.Error.WriteLine(error.ToString()); Environment.ExitCode = 1; }