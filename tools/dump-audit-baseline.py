"""Extract current vanilla counterparts for selected groups; historical mismatch
remains an explicit review concern. Does not treat arbitrary exported assets as vanilla.
Usage: python tools/dump-audit-baseline.py <group> [...]
"""
import concurrent.futures
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
WORK = ROOT / '.dump-audit'
UNREAL = ROOT.parent / 'DRGPacker4.27/DRGPacker4.27/UnrealPak/Engine/Binaries/Win64/UnrealPak.exe'
UASSET = ROOT.parent / 'UAssetGUI.exe'
BASE = pathlib.Path('C:/Program Files (x86)/Steam/steamapps/common/Deep Rock Galactic/FSD/Content/Paks/FSD-WindowsNoEditor.pak')
selected = set(sys.argv[1:])
if not selected:
    raise SystemExit('Provide exact group names.')
if selected == {'--small'}:
    inventory = json.loads((WORK / 'inventory.json').read_text(encoding='utf-8'))
    selected = {g for r in inventory['records'] if not r['error'] and
                0 < sum(a.endswith(('.uasset', '.umap')) for a in r['assets']) <= 5 for g in r['groups']}
listing = (WORK / 'base-game-list.txt').read_text(encoding='utf-8-sig')
paths = re.findall(r'LogPakFile: Display: "([^"]+)"', listing)
by_suffix = {}
for name in paths:
    if name.endswith(('.uasset', '.umap')):
        by_suffix.setdefault(name.rsplit('/', 1)[-1], []).append(name)
ledger = json.loads((WORK / 'ledger.json').read_text(encoding='utf-8'))
jobs = {}
for record in ledger['records']:
    if not selected.intersection(record['groups']):
        continue
    for file in (WORK / 'extracted' / record['sha256']).rglob('*'):
        if file.suffix.lower() not in ('.uasset', '.umap'):
            continue
        candidates = by_suffix.get(file.name, [])
        if len(candidates) == 1:
            jobs[candidates[0]] = True

def extract(asset):
    # Independent staging prevents parallel UnrealPak writes sharing a directory.
    destination = WORK / 'baseline' / pathlib.Path(asset).with_suffix('')
    destination.mkdir(parents=True, exist_ok=True)
    output = destination / 'asset.json'
    if output.exists():
        return True
    result = subprocess.run([str(UNREAL), str(BASE), '-platform=Windows', '-extract', str(destination), '-Filter=' + asset.replace('.uasset', '.*').replace('.umap', '.*')], capture_output=True, timeout=120)
    (destination / 'extract.log').write_bytes(result.stdout + result.stderr)
    files = list(destination.rglob(pathlib.Path(asset).name))
    if result.returncode or len(files) != 1:
        return False
    result = subprocess.run([str(UASSET), 'tojson', str(files[0]), str(output), '27'], capture_output=True, timeout=120)
    (destination / 'export.log').write_bytes(result.stdout + result.stderr)
    return result.returncode == 0 and output.exists()

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(extract, jobs))
(WORK / 'baseline-index.json').write_text(json.dumps({'basePak': str(BASE), 'basePakSize': BASE.stat().st_size,
    'basePakMtime': BASE.stat().st_mtime, 'assets': dict(zip(jobs, results))}, indent=2), encoding='utf-8')
print(json.dumps({'matched': len(jobs), 'exported': sum(results)}))
