# /quiz — Launch quiz mode for a certification

Starts an interactive quiz session in the terminal for the specified certification.

## Usage

```
/quiz <cert-slug> [domain] [count]
```

Examples:
- `/quiz aws-ai-practitioner`
- `/quiz aws-ai-practitioner "Domain 1" 20`

If no cert is given, list available certifications and ask.

## What to run

```bash
python core/engine.py \
  --cert  $CERT \
  --mode  quiz \
  --count ${COUNT:-20} \
  --shuffle \
  [--domain "$DOMAIN"]
```

Before launching, check that `certifications/$CERT/questions.json` exists and is non-empty.
If the bank is empty, suggest running `/ingest` first.
