"""Compare cooked properties and bytecode to freshly extracted vanilla assets.
Output is evidence for review, never an automatically accepted description.
"""
import json
import pathlib
import re
import sys

root = pathlib.Path('.dump-audit')
ledger = json.loads((root / 'ledger.json').read_text(encoding='utf-8'))
paths = re.findall(r'LogPakFile: Display: "([^"]+)"', (root / 'base-game-list.txt').read_text(encoding='utf-8-sig'))
by_path = {}
for name in paths:
    if name.endswith(('.uasset', '.umap')):
        by_path[name] = name

def properties(data):
    exports = data.get('Exports', [])
    imports = data.get('Imports', [])
    def ref(index):
        if not index:
            return None
        collection = exports if index > 0 else imports
        at = index - 1 if index > 0 else -index - 1
        if at >= len(collection):
            return index
        item = collection[at]
        # Full imported package identity avoids index-only false differences.
        return str(ref(item.get('OuterIndex', 0)) or '') + '/' + item['ObjectName']
    def canonical(prop):
        if isinstance(prop, list):
            return [canonical(p) for p in prop]
        if not isinstance(prop, dict):
            return prop
        value = prop.get('Value')
        kind = prop.get('$type', '').split(',')[0].split('.')[-1]
        if kind == 'TextPropertyData':
            return {'text': prop.get('CultureInvariantString'), 'history': prop.get('HistoryType'), 'key': value}
        if kind == 'BytePropertyData' and prop.get('EnumValue'):
            return prop['EnumValue']
        if kind in ('ObjectPropertyData', 'SoftObjectPropertyData') and isinstance(value, int):
            return ref(value)
        if 'Value' in prop:
            if isinstance(value, list) and all(isinstance(v, dict) and 'Name' in v for v in value):
                if len({v['Name'] for v in value}) == len(value):
                    return {v['Name']: canonical(v) for v in value}
                return [canonical(v) for v in value]
            return canonical(value)
        return {k: canonical(v) for k, v in prop.items() if k not in ('$type', 'Name', 'StructGUID')}
    return {ref(index + 1): {p['Name']: canonical(p) for p in e.get('Data', [])} for index, e in enumerate(exports) if isinstance(e.get('Data', []), list)}

selected = set(sys.argv[1:])
reports = []
for record in ledger['records']:
    if selected and not selected.intersection(record['groups']):
        continue
    for file in (root / 'extracted' / record['sha256']).rglob('*.json'):
        if not file.name.endswith(('.uasset.json', '.umap.json')):
            continue
        relative = file.relative_to(root / 'extracted').parts
        package_index = next((index for index, part in enumerate(relative) if part.startswith('pak-')), None)
        if package_index is None:
            continue
        package_path = '/'.join(relative[package_index + 1:]).removesuffix('.json')
        candidates = [package_path]
        if package_path.startswith('Content/'):
            candidates.append('FSD/' + package_path)
        elif package_path.startswith(('Overclocks/', 'Upgrades/')):
            candidates.append('FSD/Content/WeaponsNTools/' + package_path)
        elif not package_path.startswith('FSD/'):
            candidates.append('FSD/Content/' + package_path)
        matches = {by_path[candidate] for candidate in candidates if candidate in by_path}
        if not matches:
            matches = {name for name in by_path if name.endswith('/' + package_path)}
        if len(matches) != 1:
            continue
        match = matches.pop()
        baseline = root / 'baseline' / pathlib.Path(match).with_suffix('') / 'asset.json'
        if not baseline.exists():
            continue
        mod = properties(json.loads(file.read_text(encoding='utf-8-sig')))
        base = properties(json.loads(baseline.read_text(encoding='utf-8-sig')))
        changes = []
        for export in sorted(set(mod) & set(base)):
            for prop in sorted(set(mod[export]) | set(base[export])):
                before = base[export].get(prop, '<inherited>')
                after = mod[export].get(prop, '<inherited>')
                if before != after:
                    changes.append({'export': export, 'property': prop, 'before': before, 'after': after})
        reports.append({'groups': record['groups'], 'sha256': record['sha256'], 'asset': package_path,
                        'changes': changes, 'addedExports': sorted(set(mod) - set(base)), 'removedExports': sorted(set(base) - set(mod))})
(root / 'property-diffs.json').write_text(json.dumps(reports, ensure_ascii=False, indent=2), encoding='utf-8')
for report in reports:
    print(json.dumps(report))
