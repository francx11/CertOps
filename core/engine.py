#!/usr/bin/env python3
"""CertOps quiz and exam engine."""

import argparse
import json
import random
import sys
import time
from pathlib import Path

try:
    from rich.console import Console

    RICH_AVAILABLE = True
    _console = Console()
except ImportError:
    RICH_AVAILABLE = False
    _console = None

# Project root: two levels up from this file (core/ → project root)
_PROJECT_ROOT = Path(__file__).resolve().parent.parent


# ---------------------------------------------------------------------------
# Question bank
# ---------------------------------------------------------------------------


class QuestionBank:
    def __init__(self, cert: str, bank_root: Path = None):
        root = bank_root or (_PROJECT_ROOT / "certifications")
        bank_path = root / cert / "questions.json"
        if not bank_path.exists():
            _err(f"Question bank not found: {bank_path}")
            sys.exit(1)
        self._questions = json.loads(bank_path.read_text(encoding="utf-8"))

    @property
    def domains(self) -> list:
        return sorted(set(q["domain"] for q in self._questions))

    @property
    def total(self) -> int:
        return len(self._questions)

    def get_questions(self, domain=None, count=None, shuffle=False, seed=None) -> list:
        questions = [q for q in self._questions if domain is None or q["domain"] == domain]
        if shuffle:
            rng = random.Random(seed)
            rng.shuffle(questions)
        if count and count < len(questions):
            questions = questions[:count]
        return questions


# ---------------------------------------------------------------------------
# Output helpers
# ---------------------------------------------------------------------------


def _out(text=""):
    if RICH_AVAILABLE:
        _console.print(text)
    else:
        print(text)


def _err(text):
    print(f"[error] {text}", file=sys.stderr)


def _fmt_correct(correct) -> str:
    if isinstance(correct, list):
        return ", ".join(correct)
    return correct


def _check_answer(raw: str, correct) -> bool:
    if isinstance(correct, list):
        given = set(a.strip().upper() for a in raw.split(",") if a.strip())
        return given == set(correct)
    return raw.strip().upper() == correct.upper()


def _prompt_answer(correct) -> str:
    if isinstance(correct, list):
        return input("Your answers (comma-separated, e.g. A,C): ").strip()
    return input("Your answer [A-F]: ").strip()


def _display_question(q: dict, index: int, total: int, header_extra: str = ""):
    _out()
    header = f"Question {index}/{total}  [{q['domain']}]"
    if header_extra:
        header += f"  {header_extra}"
    _out(f"--- {header} ---")
    _out()
    _out(q["question"])
    _out()
    for key in sorted(q["options"]):
        _out(f"  {key}. {q['options'][key]}")
    _out()


# ---------------------------------------------------------------------------
# Quiz mode
# ---------------------------------------------------------------------------


def run_quiz(questions: list, show_explanations: bool = True) -> dict:
    total = len(questions)
    correct_count = 0
    domain_stats: dict = {}

    for i, q in enumerate(questions, 1):
        domain = q["domain"]
        domain_stats.setdefault(domain, [0, 0])
        domain_stats[domain][1] += 1

        _display_question(q, i, total)

        user_answer = _prompt_answer(q["correct"])
        is_correct = _check_answer(user_answer, q["correct"])

        if is_correct:
            _out("  CORRECT")
            correct_count += 1
            domain_stats[domain][0] += 1
        else:
            _out(f"  INCORRECT. Correct answer: {_fmt_correct(q['correct'])}")

        if show_explanations and q.get("explanation"):
            _out(f"  {q['explanation']}")

        if i < total:
            try:
                input("  [Press Enter for next question]")
            except EOFError:
                pass

    return {"domain_stats": domain_stats, "correct": correct_count, "total": total}


# ---------------------------------------------------------------------------
# Exam mode
# ---------------------------------------------------------------------------


def run_exam(questions: list, time_limit_minutes: int, pass_threshold: float = 0.70) -> dict | None:
    total = len(questions)
    recorded: dict = {}
    start = time.monotonic()

    for i, q in enumerate(questions, 1):
        elapsed = time.monotonic() - start
        remaining = time_limit_minutes * 60 - elapsed
        if remaining <= 0:
            _out("\n[TIME UP]")
            break

        mins_left = int(remaining // 60)
        secs_left = int(remaining % 60)
        _display_question(q, i, total, header_extra=f"{mins_left:02d}:{secs_left:02d} remaining")
        _out("  (Type Q to exit options)")

        user_answer = _prompt_answer(q["correct"])

        if user_answer.strip().upper() == "Q":
            _out()
            _out("  F) Finish now — see partial score report")
            _out("  X) Exit without score")
            try:
                choice = input("  Choice [F/X]: ").strip().upper()
            except EOFError:
                choice = "X"
            if choice == "X":
                _out("[Exam aborted]")
                return None
            # F or anything else → finish with partial score
            _out("[Exam ended early]")
            break

        recorded[q["id"]] = (user_answer, q)

    time_taken = time.monotonic() - start
    _out(f"\n[Exam complete — {int(time_taken // 60)}m {int(time_taken % 60)}s]")

    correct_count = 0
    domain_stats: dict = {}
    for qid, (user_answer, q) in recorded.items():
        domain = q["domain"]
        domain_stats.setdefault(domain, [0, 0])
        domain_stats[domain][1] += 1
        if _check_answer(user_answer, q["correct"]):
            correct_count += 1
            domain_stats[domain][0] += 1

    return {
        "domain_stats": domain_stats,
        "correct": correct_count,
        "total": total,
        "time_taken": time_taken,
        "time_limit": time_limit_minutes * 60,
        "pass_threshold": pass_threshold,
    }


# ---------------------------------------------------------------------------
# Score report
# ---------------------------------------------------------------------------


def print_score_report(result: dict):
    domain_stats = result["domain_stats"]
    correct = result["correct"]
    total = result["total"]
    pass_threshold = result.get("pass_threshold", 0.70)
    time_taken = result.get("time_taken")
    time_limit = result.get("time_limit")

    _out()
    _out("=" * 62)
    _out("  SCORE REPORT")
    _out("=" * 62)

    for domain in sorted(domain_stats):
        d_correct, d_total = domain_stats[domain]
        pct = d_correct / d_total if d_total else 0
        status = "PASS" if pct >= pass_threshold else "FAIL"
        _out(f"  {domain:<34} {d_correct}/{d_total}  ({pct:.0%})  [{status}]")

    _out("-" * 62)
    total_pct = correct / total if total else 0
    status = "PASS" if total_pct >= pass_threshold else "FAIL"
    _out(f"  {'TOTAL':<34} {correct}/{total}  ({total_pct:.0%})  [{status}]")
    _out(f"  Pass threshold: {pass_threshold:.0%}")

    if time_taken is not None and time_limit is not None:
        taken_m = int(time_taken // 60)
        taken_s = int(time_taken % 60)
        limit_m = int(time_limit // 60)
        _out(f"  Time: {taken_m}m {taken_s}s / {limit_m}m")

    _out("=" * 62)


# ---------------------------------------------------------------------------
# CLI helpers
# ---------------------------------------------------------------------------


def _list_certs(bank_root: Path) -> list:
    if not bank_root.exists():
        return []
    return sorted(
        p.name for p in bank_root.iterdir() if p.is_dir() and (p / "questions.json").exists()
    )


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------


def main():
    ap = argparse.ArgumentParser(description="CertOps quiz and exam engine.")
    ap.add_argument("--cert", required=True, help="Certification slug, e.g. aws-ai-practitioner")
    ap.add_argument(
        "--mode",
        choices=["quiz", "exam"],
        default="quiz",
        help="quiz: immediate feedback | exam: timed, score at end",
    )
    ap.add_argument("--domain", default=None, help="Filter questions by domain")
    ap.add_argument("--count", type=int, default=None, help="Number of questions to include")
    ap.add_argument("--shuffle", action="store_true", help="Randomize question order")
    ap.add_argument("--seed", type=int, default=None, help="Random seed for reproducible shuffles")
    ap.add_argument(
        "--time-limit", type=int, default=90, help="Exam time limit in minutes (default: 90)"
    )
    ap.add_argument(
        "--no-explanations", action="store_true", help="Hide explanations after each quiz answer"
    )
    ap.add_argument("--bank-root", default=None, help="Override path to certifications/ directory")
    ap.add_argument(
        "--list-certs", action="store_true", help="List available certifications and exit"
    )
    args = ap.parse_args()

    bank_root = Path(args.bank_root) if args.bank_root else (_PROJECT_ROOT / "certifications")

    if args.list_certs:
        certs = _list_certs(bank_root)
        if certs:
            for c in certs:
                _out(c)
        else:
            _out("No certifications found.")
        return

    bank = QuestionBank(cert=args.cert, bank_root=bank_root)
    questions = bank.get_questions(
        domain=args.domain,
        count=args.count,
        shuffle=args.shuffle,
        seed=args.seed,
    )

    if not questions:
        _err("No questions match the given filters.")
        sys.exit(1)

    _out(f"[certops] {args.cert} | {len(questions)} questions | mode={args.mode}")
    if args.domain:
        _out(f"[certops] domain filter: {args.domain}")
    _out(f"[certops] Available domains: {', '.join(bank.domains)}")

    if args.mode == "quiz":
        result = run_quiz(questions, show_explanations=not args.no_explanations)
        result["pass_threshold"] = 0.70
    else:
        result = run_exam(questions, time_limit_minutes=args.time_limit)
        if result is None:
            return

    print_score_report(result)


if __name__ == "__main__":
    main()
