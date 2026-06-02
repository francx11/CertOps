#!/usr/bin/env python3
"""ETL pipeline: parse HTML question dumps into a normalized JSON question bank."""

import argparse
import hashlib
import html
import html.parser
import json
import re
import sys
from datetime import date
from pathlib import Path

# ---------------------------------------------------------------------------
# Text normalization and ID generation
# ---------------------------------------------------------------------------

# CP1252-in-UTF8 artifacts that appear when UTF-8 is misread as latin-1
_CP1252_FIXES = {
    "â": "'",  # â€™ → '
    "â": '"',  # â€œ → "
    "â": '"',  # â€ → "
    "â": "-",  # â€" → –
    "â": "-",  # â€" → —
    "â": "'",  # lone â artifact (e.g. "companyâs" → "company's")
}

# Unicode typographic punctuation → ASCII equivalents
_UNICODE_FIXES = {
    "“": '"',
    "”": '"',
    "‘": "'",
    "’": "'",
    "–": "-",
    "—": "-",
    " ": " ",
}


def _clean_text(text: str) -> str:
    """Decode entities, strip tags, fix encoding artifacts, collapse whitespace."""
    text = html.unescape(text)
    text = re.sub(r"<[^>]+>", "", text)
    for src, dst in _CP1252_FIXES.items():
        text = text.replace(src, dst)
    for src, dst in _UNICODE_FIXES.items():
        text = text.replace(src, dst)
    return re.sub(r"\s+", " ", text).strip()


def normalize_question_text(text: str) -> str:
    """Return normalized lowercase text used as the stable hash input."""
    return _clean_text(text).lower()


def generate_id(question_text: str) -> str:
    """SHA-256 of normalized question stem, first 12 hex chars."""
    normalized = normalize_question_text(question_text)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:12]


# ---------------------------------------------------------------------------
# Primary parser: custom question-viewer format
#
# DOM pattern:
#   <div class="question">
#     <h2>Pregunta N</h2>
#     <p style="white-space: pre-wrap;">...stem...</p>
#     <pre style="white-space: pre-wrap;">A.. opt\nB.. opt\n...</pre>
#     <button>...</button>
#     <div class="correct-answer" style="display:none;">
#       Respuesta correcta: X
#     </div>
#   </div>
# ---------------------------------------------------------------------------


class CustomViewerParser(html.parser.HTMLParser):
    """SAX-style parser for the custom question-viewer HTML format."""

    _OPTION_RE = re.compile(r"^([A-F])\.\.\s*(.+)", re.DOTALL)
    _ANSWER_RE = re.compile(r"Respuesta correcta:\s*([A-F]+|\[Image[^\]]*\])", re.IGNORECASE)

    def __init__(self, source: str, domain: str):
        super().__init__()
        self.source = source
        self.domain = domain
        self.questions: list = []
        self.skipped_hotspot: int = 0

        self._in_question = False
        self._div_depth = 0  # nested div count inside div.question
        self._in_answer = False
        self._in_stem = False
        self._in_pre = False

        self._stem_buf: list = []
        self._pre_buf: list = []
        self._answer_buf: list = []

    # -- HTMLParser interface ------------------------------------------------

    def handle_starttag(self, tag, attrs):
        """Track entry into question blocks, stems, option pres, and answer divs."""
        attr = dict(attrs)
        classes = attr.get("class", "").split()
        style = attr.get("style", "")

        if tag == "div":
            if not self._in_question:
                if "question" in classes:
                    self._in_question = True
                    self._div_depth = 0
                    self._reset_buffers()
            else:
                self._div_depth += 1
                if "correct-answer" in classes:
                    self._in_answer = True
                    self._answer_buf = []
            return

        if not self._in_question:
            return

        if tag == "p" and "pre-wrap" in style and not self._in_answer and not self._in_pre:
            self._in_stem = True
            self._stem_buf = []

        elif tag == "pre" and "pre-wrap" in style:
            self._in_pre = True
            self._pre_buf = []

        elif tag == "img" and self._in_stem:
            alt = attr.get("alt", "no alt")
            self._stem_buf.append(f"[IMAGE: {alt}]")

        elif tag == "br" and self._in_stem:
            self._stem_buf.append(" ")

    def handle_endtag(self, tag):
        """Close open blocks and trigger question finalization on </div.correct-answer>."""
        if not self._in_question:
            return

        if tag == "p" and self._in_stem:
            self._in_stem = False

        elif tag == "pre" and self._in_pre:
            self._in_pre = False

        elif tag == "div":
            if self._in_answer:
                # This </div> closes div.correct-answer
                self._in_answer = False
                self._finalize_question()
                self._div_depth -= 1
            elif self._div_depth > 0:
                self._div_depth -= 1
            else:
                # This </div> closes the outer div.question
                self._in_question = False

    def handle_data(self, data):
        """Accumulate text into the active buffer (stem, pre, or answer)."""
        if self._in_stem:
            self._stem_buf.append(data)
        elif self._in_pre:
            self._pre_buf.append(data)
        elif self._in_answer:
            self._answer_buf.append(data)

    # -- Internal helpers ---------------------------------------------------

    def _reset_buffers(self):
        """Clear all per-question accumulators."""
        self._stem_buf = []
        self._pre_buf = []
        self._answer_buf = []
        self._in_stem = False
        self._in_pre = False
        self._in_answer = False

    def _parse_options(self, pre_text: str) -> dict:
        """Parse the <pre> block into an {A: text, B: text, ...} options dict."""
        options: dict = {}
        current_key = None
        current_lines: list = []

        for raw_line in pre_text.splitlines():
            line = raw_line.strip()
            m = self._OPTION_RE.match(line)
            if m:
                if current_key is not None:
                    options[current_key] = " ".join(current_lines).strip()
                current_key = m.group(1)
                current_lines = [m.group(2).strip()]
            elif current_key is not None and line:
                current_lines.append(line)

        if current_key is not None:
            options[current_key] = " ".join(current_lines).strip()

        return options

    def _parse_correct(self, answer_text: str):
        """Return str (single) or list (multi-select), or None for hotspot."""
        m = self._ANSWER_RE.search(answer_text)
        if not m:
            return None
        raw = m.group(1).strip()
        if raw.startswith("[Image"):
            return None
        letters = [ch for ch in raw if ch in "ABCDEF"]
        if not letters:
            return None
        if len(letters) == 1:
            return letters[0]
        return sorted(set(letters))

    def _finalize_question(self):
        """Validate and append the current question to self.questions, then reset."""
        stem = _clean_text("".join(self._stem_buf))
        pre_text = "".join(self._pre_buf)
        answer_text = "".join(self._answer_buf)

        # Skip HOTSPOT questions (options block is "nan" or empty)
        if pre_text.strip().lower() in ("nan", ""):
            self.skipped_hotspot += 1
            self._reset_buffers()
            return

        options = self._parse_options(pre_text)
        if not options:
            self.skipped_hotspot += 1
            self._reset_buffers()
            return

        correct = self._parse_correct(answer_text)
        if correct is None:
            self.skipped_hotspot += 1
            self._reset_buffers()
            return

        if not stem or len(stem) < 10:
            self._reset_buffers()
            return

        qid = generate_id(stem)
        answer_label = correct if isinstance(correct, str) else ", ".join(correct)
        explanation = f"Correct answer is {answer_label}."

        self.questions.append(
            {
                "id": qid,
                "domain": self.domain,
                "question": stem,
                "options": options,
                "correct": correct,
                "explanation": explanation,
                "source": self.source,
                "tags": [],
                "added": date.today().isoformat(),
            }
        )

        self._reset_buffers()


# ---------------------------------------------------------------------------
# Fallback parser: line-pattern heuristics for unknown formats
# ---------------------------------------------------------------------------


class GenericQAParser:
    """Heuristic Q&A parser for HTML that doesn't match the custom viewer format."""

    _Q_RE = re.compile(r"^\d+[.)]\s+(.+)")
    _OPT_RE = re.compile(r"^([A-F])[.)]\s+(.+)")
    _ANS_RE = re.compile(r"(?:Answer|Correct)[:\s]+([A-F]+)", re.IGNORECASE)

    def __init__(self, source: str, domain: str):
        """Initialize parser state for a single source file."""
        self.source = source
        self.domain = domain
        self.questions: list = []
        self.skipped_hotspot: int = 0

    def parse(self, text: str):
        """Parse plain text into questions using line-pattern heuristics."""
        lines = text.splitlines()
        stem_parts: list = []
        options: dict = {}
        current_key = None
        correct = None

        def flush():
            nonlocal stem_parts, options, current_key, correct
            if not stem_parts or not options:
                return
            stem = " ".join(stem_parts).strip()
            if len(stem) < 10:
                return
            qid = generate_id(stem)
            self.questions.append(
                {
                    "id": qid,
                    "domain": self.domain,
                    "question": stem,
                    "options": dict(options),
                    "correct": correct or list(options.keys())[0],
                    "explanation": (
                        f"Correct answer is {correct}." if correct else "No answer detected."
                    ),
                    "source": self.source,
                    "tags": [],
                    "added": date.today().isoformat(),
                }
            )
            stem_parts = []
            options = {}
            current_key = None
            correct = None

        for line in lines:
            line = line.strip()
            q_m = self._Q_RE.match(line)
            opt_m = self._OPT_RE.match(line)
            ans_m = self._ANS_RE.search(line)

            if q_m:
                flush()
                stem_parts = [q_m.group(1)]
                current_key = None
            elif opt_m:
                current_key = opt_m.group(1)
                options[current_key] = opt_m.group(2)
            elif ans_m:
                raw = ans_m.group(1).strip()
                letters = [ch for ch in raw if ch in "ABCDEF"]
                if letters:
                    correct = letters[0] if len(letters) == 1 else sorted(set(letters))
            elif current_key and line and not ans_m:
                options[current_key] = options[current_key] + " " + line
            elif stem_parts and not options and line:
                stem_parts.append(line)

        flush()


# ---------------------------------------------------------------------------
# Format detection, file ingestion, and merge
# ---------------------------------------------------------------------------


def detect_parser(content: str) -> str:
    """Return 'custom_viewer' or 'generic' based on HTML fingerprint."""
    if 'class="question"' in content and "correct-answer" in content:
        return "custom_viewer"
    return "generic"


def ingest_file(path: Path, domain: str, verbose: bool) -> list:
    """Parse one HTML file and return a list of raw question dicts."""
    content = path.read_text(encoding="utf-8", errors="replace")
    fmt = detect_parser(content)
    source = path.name

    if fmt == "custom_viewer":
        parser = CustomViewerParser(source=source, domain=domain)
        parser.feed(content)
        if verbose:
            print(
                f"  [custom_viewer] {source}: {len(parser.questions)} parsed, "
                f"{parser.skipped_hotspot} hotspot skipped"
            )
        return parser.questions
    else:
        plain = re.sub(r"<[^>]+>", " ", content)
        parser = GenericQAParser(source=source, domain=domain)
        parser.parse(plain)
        if verbose:
            print(f"  [generic] {source}: {len(parser.questions)} parsed")
        return parser.questions


def load_existing(output_path: Path) -> dict:
    """Load existing question bank as {id: question} dict."""
    if output_path.exists():
        data = json.loads(output_path.read_text(encoding="utf-8"))
        return {q["id"]: q for q in data}
    return {}


def merge_questions(existing: dict, new_questions: list) -> tuple:
    """Merge new_questions into existing bank; return (new_count, skipped_count, sorted_list)."""
    new_count = 0
    skipped_count = 0
    seen = set(existing.keys())

    for q in new_questions:
        if q["id"] in seen:
            skipped_count += 1
        else:
            seen.add(q["id"])
            existing[q["id"]] = q
            new_count += 1

    final = sorted(existing.values(), key=lambda x: x["added"])
    return new_count, skipped_count, final


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------


def main():
    """Parse CLI arguments and run the ingest pipeline."""
    ap = argparse.ArgumentParser(
        description="Ingest HTML question dumps into a CertOps question bank."
    )
    ap.add_argument(
        "--input", required=True, help="Path to an HTML file or a directory containing HTML files"
    )
    ap.add_argument("--output", required=True, help="Path to the output questions.json file")
    ap.add_argument(
        "--domain",
        default="General",
        help="Domain tag applied to all ingested questions (default: General)",
    )
    ap.add_argument(
        "--dry-run", action="store_true", help="Parse and report counts without writing anything"
    )
    ap.add_argument("--verbose", action="store_true", help="Print per-file progress details")
    args = ap.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if input_path.is_dir():
        html_files = sorted(input_path.glob("*.html")) + sorted(input_path.glob("*.htm"))
    elif input_path.is_file():
        html_files = [input_path]
    else:
        print(f"[error] Input not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    if not html_files:
        print("[ingest] No HTML files found.")
        return

    print(f"[ingest] Scanning: {input_path}")
    existing = load_existing(output_path)
    all_parsed: list = []

    for f in html_files:
        if args.verbose:
            print(f"[ingest] Processing: {f.name}")
        parsed = ingest_file(f, domain=args.domain, verbose=args.verbose)
        all_parsed.extend(parsed)

    new_count, skipped_count, merged = merge_questions(existing, all_parsed)
    total = len(merged)

    print(f"[ingest] Results: {new_count} new | {skipped_count} dupes skipped | {total} total")

    if args.dry_run:
        print("[ingest] Dry run — nothing written.")
        return

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[ingest] Written: {output_path}")


if __name__ == "__main__":
    main()
