"""Produce compact, resolved JSON evidence without claiming semantic verification."""
import json
import pathlib
import sys

root = pathlib.Path('.dump-audit')
ledger = json.loads((root / 'ledger.json').read_text(encoding='utf-8'))
selected = set(sys.argv[1:])

def summarize(data):
    exports = data.get('Exports', [])
    imports = data.get('Imports', [])
    def ref(index):
        if not isinstance(index, int) or not index:
            return index
        collection = exports if index > 0 else imports
        at = index - 1 if index > 0 else -index - 1
        return collection[at].get('ObjectName', index) if at < len(collection) else index
    def compact(value):
        if isinstance(value, list):
            return [compact(v) for v in value]
        if not isinstance(value, dict):
            return value
        result = {}
        for key, item in value.items():
            if key == '$type':
                result['type'] = item.split(',')[0].split('.')[-1]
            elif key in ('StackNode', 'ObjectRef', 'ObjectPointer', 'SuperStruct', 'ClassIndex', 'ContextExpressionObject'):
                result[key] = ref(item)
            elif item is not None and key not in ('Dummy', 'PropertyGuid', 'Ancestry', 'PropertyTagFlags', 'IsZero', 'ArrayIndex', 'Offset', 'Flags', 'Extras', 'IsUnversioned', 'PropertyTypeName'):
                result[key] = compact(item)
        return result
    return [{'name': e['ObjectName'], 'class': ref(e.get('ClassIndex')),
             'unparsed': 'RawExport' in e.get('$type', ''),
             'data': compact(e.get('Data', [])) if isinstance(e.get('Data', []), list) else [], 'script': compact(e.get('ScriptBytecode', []))}
            for e in exports if e.get('Data') or e.get('ScriptBytecode')]

output = root / 'summaries'
output.mkdir(exist_ok=True)
for record in ledger['records']:
    if selected and not selected.intersection(record['groups']):
        continue
    extracted = root / 'extracted' / record['sha256']
    if not extracted.exists():
        continue
    assets = []
    for file in extracted.rglob('*.json'):
        if not file.name.endswith(('.uasset.json', '.umap.json')):
            continue
        data = json.loads(file.read_text(encoding='utf-8-sig'))
        assets.append({'asset': str(file.relative_to(extracted)), 'exports': summarize(data)})
    (output / (record['sha256'] + '.json')).write_text(json.dumps(assets, ensure_ascii=False, indent=2), encoding='utf-8')
print('Summaries saved under .dump-audit/summaries')
