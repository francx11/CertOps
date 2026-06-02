# CertOps

Universal framework for cloud certification exam preparation. Converts raw HTML question dumps into a normalized JSON question bank and provides an interactive CLI quiz/exam engine.

## Architecture

```
certifications/<cert>/raw/*.html
          │
    [scripts/ingest_html.py]  ← ETL: HTML → JSON
          │
certifications/<cert>/questions.json
          │
      [core/engine.py]        ← Quiz / Exam CLI
          │
        terminal

[core/schema.json]  ← validates all question banks
[.github/workflows/validate.yml]  ← CI runs on push/PR
```

## Quick Start

```bash
# Ingest HTML files for a certification
python scripts/ingest_html.py \
  --input  certifications/aws-ai-practitioner/raw/ \
  --output certifications/aws-ai-practitioner/questions.json

# Run a 20-question quiz (shuffled)
python core/engine.py --cert aws-ai-practitioner --mode quiz --count 20 --shuffle

# Run a full simulated exam (65 questions, 90-minute timer)
python core/engine.py --cert aws-ai-practitioner --mode exam --count 65
```

## Engine Reference

```
python core/engine.py
  --cert        <slug>           Required. e.g. aws-ai-practitioner
  --mode        quiz|exam        Default: quiz
  --domain      "Domain 1"       Filter to one domain
  --count       N                Number of questions
  --shuffle                      Randomize order
  --seed        42               Reproducible shuffle
  --time-limit  90               Exam time limit in minutes (default: 90)
  --no-explanations              Hide explanations after each quiz answer
  --list-certs                   List available certifications and exit
```

**Quiz mode**: one question at a time, immediate feedback + explanation, per-domain stats at end.

**Exam mode**: fixed count, countdown timer, no feedback until end, pass/fail at 70%.

## Ingest Reference

```
python scripts/ingest_html.py
  --input   PATH     HTML file or directory of HTML files (required)
  --output  PATH     Output questions.json path (required)
  --domain  "..."    Domain tag for all ingested questions (default: General)
  --dry-run          Report counts without writing anything
  --verbose          Print per-file details
```

Supported HTML format: custom question-viewer (`div.question` + `div.correct-answer`).
Fallback: generic heuristic parser for other Q&A HTML structures.

HOTSPOT questions (image-based drag-drop) are automatically detected and skipped.

## Adding a New Certification

1. Create `certifications/<cert-slug>/`
2. Create `certifications/<cert-slug>/raw/` — place HTML dump files here
3. Optionally create `certifications/<cert-slug>/theory/` for Markdown study guides
4. Run ingest:
   ```bash
   python scripts/ingest_html.py \
     --input  certifications/<cert-slug>/raw/ \
     --output certifications/<cert-slug>/questions.json \
     --domain "General"
   ```
5. Push — CI validates the new bank automatically

Supported cert slugs (directory names under `certifications/`):
- `aws-ai-practitioner`

## Schema Reference

Each entry in `questions.json` is a JSON object:

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | string | 12 lowercase hex chars (SHA-256 of normalized stem) |
| `domain` | string | Non-empty |
| `question` | string | Min 10 chars |
| `options` | object | Keys A–F only, 2–6 entries |
| `correct` | string or array | Single `"A"`–`"F"` or sorted list for multi-select |
| `explanation` | string | Non-empty |
| `source` | string | Source HTML filename |
| `tags` | array | Unique strings |
| `added` | string | ISO date `YYYY-MM-DD` |

## Running Tests

```bash
python -m unittest discover tests/

# Schema tests require jsonschema
pip install jsonschema
python -m unittest tests/test_schema.py
```

## Slash Commands

| Command | Description |
|---------|-------------|
| `/ingest <cert>` | Run ETL for a certification |
| `/quiz <cert> [domain] [count]` | Launch quiz mode |
| `/validate` | Validate all question banks against schema |
| `/theory <cert> <domain-number>` | Generate theory study guide for a domain (Spanish) |

## Contribution Rules

- **Never manually edit `questions.json`** — always use `ingest_html.py`
- **IDs are stable** — do not regenerate them after a question enters the bank
- Run `--dry-run` before committing a new ingest to review what will be added
- Theory files in `theory/` are Markdown; filenames should reflect domain names; **all theory content must be written in Spanish**
- Raw HTML files in `raw/` are gitignored by default to keep the repo light — only commit if they are fully anonymized
