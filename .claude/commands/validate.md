# /validate — Validate all question banks against schema

Checks every `questions.json` in `certifications/` against `core/schema.json` using jsonschema. Reports OK or FAIL per bank. Exits with an error summary if any fail.

## What to run

```bash
python -c "
import json, sys
from pathlib import Path
try:
    import jsonschema
except ImportError:
    print('ERROR: jsonschema not installed. Run: pip install jsonschema')
    sys.exit(1)

schema = json.loads(Path('core/schema.json').read_text())
banks = sorted(Path('certifications').glob('*/questions.json'))

if not banks:
    print('No question banks found.')
    sys.exit(0)

errors = []
for p in banks:
    data = json.loads(p.read_text())
    try:
        jsonschema.validate(instance=data, schema=schema)
        print(f'  OK  {p} ({len(data)} questions)')
    except jsonschema.ValidationError as e:
        errors.append(str(e.message))
        print(f'FAIL {p}: {e.message}')

if errors:
    print(f'\n{len(errors)} error(s) found')
    sys.exit(1)
else:
    print(f'\nAll {len(banks)} bank(s) valid')
"
```

Report the output clearly. If any bank fails, explain which field violated the schema and how to fix it.
