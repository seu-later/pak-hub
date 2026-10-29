"""Render selected cooked functions/properties compactly for human analysis."""
import json
import pathlib
import sys
sys.stdout.reconfigure(encoding='utf-8')

root = pathlib.Path('.dump-audit')
ledger = json.loads((root / 'ledger.json').read_text(encoding='utf-8'))
selected = set(sys.argv[1:])

def walk(value):
    if isinstance(value, dict):
        yield value
        for item in value.values():
            yield from walk(item)
    elif isinstance(value, list):
        for item in value:
            yield from walk(item)

def expression(value):
    if not isinstance(value, dict):
        return str(value)
    kind = value.get('type', '')
    if 'Variable' in kind:
        return '.'.join(value.get('Variable', {}).get('New', {}).get('Path', []))
    if kind in ('EX_CallMath', 'EX_FinalFunction', 'EX_LocalFinalFunction', 'EX_LocalVirtualFunction', 'EX_VirtualFunction'):
        return str(value.get('StackNode', value.get('VirtualFunctionName'))) + '(' + ', '.join(expression(v) for v in value.get('Parameters', [])) + ')'
    if kind in ('EX_Let', 'EX_LetBool', 'EX_LetObj'):
        return expression(value.get('Variable', value.get('VariableExpression', {}))) + ' = ' + expression(value.get('Expression', value.get('AssignmentExpression', {})))
    if kind in ('EX_Context', 'EX_Context_FailSilent'):
        return expression(value.get('ObjectExpression', {})) + '.' + expression(value.get('ContextExpression', {}))
    if kind in ('EX_Jump', 'EX_JumpIfNot', 'EX_PopExecutionFlowIfNot', 'EX_PushExecutionFlow'):
        return kind + ' ' + str(value.get('CodeOffset', value.get('PushingAddress', ''))) + ' ' + expression(value.get('BooleanExpression', {}))
    if kind == 'EX_Self':
        return 'self'
    if 'Const' in kind:
        return str(value.get('Value', value.get('Elements', '')))
    if kind in ('EX_True', 'EX_False', 'EX_NoObject', 'EX_Nothing'):
        return kind[3:]
    return kind + '(' + ', '.join(expression(v) for k, v in value.items() if isinstance(v, dict)) + ')'

for record in ledger['records']:
    if not selected.intersection(record['groups']):
        continue
    print('\nGROUP', ', '.join(record['groups']), record['sha256'])
    summary = root / 'summaries' / (record['sha256'] + '.json')
    if not summary.exists():
        continue
    for asset in json.loads(summary.read_text(encoding='utf-8')):
        print('ASSET', asset['asset'])
        for export in asset['exports']:
            if export['script']:
                print('FUNCTION', export['name'])
                for item in export['script']:
                    print(' ', expression(item))
            elif export['name'].startswith('Default__'):
                print('DEFAULTS', export['name'])
                for prop in export['data']:
                    if isinstance(prop, dict):
                        print(' ', prop.get('Name'), json.dumps(prop.get('Value'), ensure_ascii=False))
