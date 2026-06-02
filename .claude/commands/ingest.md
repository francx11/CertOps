# /ingest — Run ETL ingest for a certification

Parses all HTML files in a certification's `raw/` directory and merges new questions into `questions.json`. Skips duplicates. Reports new / skipped / total counts.

## Usage

```
/ingest <cert-slug>
```

Example: `/ingest aws-ai-practitioner`

If no cert slug is given, list available certifications from the `certifications/` directory and ask which one to process.

## What to run

```bash
python scripts/ingest_html.py \
  --input  certifications/$CERT/raw/ \
  --output certifications/$CERT/questions.json \
  --verbose
```

After running, report:
- How many questions were newly added
- How many were skipped as duplicates
- How many HOTSPOT questions were skipped
- New total count in the bank

If the `certifications/$CERT/raw/` directory is empty or missing, say so clearly.
