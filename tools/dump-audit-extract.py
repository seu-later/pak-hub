"""Read-only package extraction and cooked JSON export for explicitly chosen groups.
Usage: python tools/dump-audit-extract.py <group> [group ...]
Outputs remain private in .dump-audit/extracted/<sha256>/.
"""
import concurrent.futures
import json
import pathlib
import subprocess
import sys
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
WORK = ROOT / '.dump-audit'
TOOLS = ROOT.parent
UNREAL = TOOLS / 'DRGPacker4.27/DRGPacker4.27/UnrealPak/Engine/Binaries/Win64/UnrealPak.exe'
UASSET = TOOLS / 'UAssetGUI.exe'
ledger = json.loads((WORK / 'ledger.json').read_text(encoding='utf-8'))
selected = set(sys.argv[1:])
if not selected:
    raise SystemExit('Provide exact group names; no implicit full extraction.')

def run(args, log):
    try:
        result = subprocess.run([str(a) for a in args], capture_output=True, timeout=120)
        log.write_bytes(result.stdout + result.stderr)
        return result.returncode
    except subprocess.TimeoutExpired:
        log.write_text('Timed out after 120 seconds', encoding='utf-8')
        return -1

def inspect(record):
    root = WORK / 'extracted' / record['sha256']
    root.mkdir(parents=True, exist_ok=True)
    package = pathlib.Path(record['packagePath'])
    if zipfile.is_zipfile(package):
        archive_root = root / 'zip'
        with zipfile.ZipFile(package) as archive:
            for item in archive.infolist():
                target = (archive_root / item.filename).resolve()
                if not target.is_relative_to(archive_root.resolve()):
                    raise ValueError('ZIP member leaves extraction directory')
            archive.extractall(archive_root)
        packages = list(archive_root.rglob('*.pak'))
        export_roots = [archive_root]
    else:
        packages = [package]
        export_roots = []
    for number, pak in enumerate(packages):
        package_root = root / f'pak-{number}'
        package_root.mkdir(exist_ok=True)
        if not (package_root / '.extracted').exists():
            code = run([UNREAL, pak, '-platform=Windows', '-extract', package_root], root / f'extract-{number}.log')
            if code:
                continue
            (package_root / '.extracted').touch()
        export_roots.append(package_root)
    for export_root in export_roots:
        for asset in list(export_root.rglob('*.uasset')) + list(export_root.rglob('*.umap')):
            output = asset.with_suffix(asset.suffix + '.json')
            if not output.exists():
                run([UASSET, 'tojson', asset, output, '27'], asset.with_suffix('.export.log'))
    return {'sha256': record['sha256'], 'groups': record['groups'],
            'assets': len(list(root.rglob('*.uasset'))) + len(list(root.rglob('*.umap'))),
            'json': len(list(root.rglob('*.json')))}

if selected == {'--small'}:
    inventory = json.loads((WORK / 'inventory.json').read_text(encoding='utf-8'))
    eligible = {r['sha256'] for r in inventory['records'] if not r['error'] and
                0 < sum(a.endswith(('.uasset', '.umap')) for a in r['assets']) <= 5}
    records = [r for r in ledger['records'] if r['sha256'] in eligible and r['packagePath']]
else:
    records = [r for r in ledger['records'] if selected.intersection(r['groups']) and r['packagePath']]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    for result in executor.map(inspect, records):
        print(json.dumps(result), flush=True)
