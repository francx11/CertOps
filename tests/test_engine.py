"""Tests for the QuestionBank, _check_answer, and _fmt_correct functions in core/engine.py."""

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "core"))
from engine import QuestionBank, _check_answer, _fmt_correct


def _make_bank(questions: list, tmp_dir: Path, cert: str = "test-cert") -> Path:
    cert_dir = tmp_dir / cert
    cert_dir.mkdir(parents=True, exist_ok=True)
    bank_path = cert_dir / "questions.json"
    bank_path.write_text(json.dumps(questions), encoding="utf-8")
    return tmp_dir


def _sample_questions():
    return [
        {
            "id": f"aaa{i:09d}",
            "domain": "Domain A" if i % 2 == 0 else "Domain B",
            "question": f"Question number {i} about machine learning concepts.",
            "options": {"A": "First", "B": "Second", "C": "Third", "D": "Fourth"},
            "correct": "A",
            "explanation": "A is correct.",
            "source": "test.html",
            "tags": [],
            "added": f"2024-01-{i:02d}",
        }
        for i in range(1, 11)
    ]


class TestQuestionBank(unittest.TestCase):
    """Tests for QuestionBank loading, filtering, and shuffling behavior."""

    def setUp(self):
        """Create a temporary directory and populate it with a 10-question test bank."""
        self._tmp = tempfile.TemporaryDirectory()
        self._root = Path(self._tmp.name)
        self._questions = _sample_questions()
        _make_bank(self._questions, self._root)

    def tearDown(self):
        """Clean up the temporary directory."""
        self._tmp.cleanup()

    def test_loads_all_questions(self):
        """Loading a bank with 10 questions reports total == 10."""
        bank = QuestionBank("test-cert", bank_root=self._root)
        self.assertEqual(bank.total, 10)

    def test_domain_filter(self):
        """Domain filter returns only questions matching the requested domain."""
        bank = QuestionBank("test-cert", bank_root=self._root)
        qs = bank.get_questions(domain="Domain A")
        self.assertTrue(all(q["domain"] == "Domain A" for q in qs))
        self.assertGreater(len(qs), 0)

    def test_count_limit(self):
        """count=3 returns exactly 3 questions."""
        bank = QuestionBank("test-cert", bank_root=self._root)
        qs = bank.get_questions(count=3)
        self.assertEqual(len(qs), 3)

    def test_count_larger_than_bank_returns_all(self):
        """Count larger than bank size returns all questions."""
        bank = QuestionBank("test-cert", bank_root=self._root)
        qs = bank.get_questions(count=999)
        self.assertEqual(len(qs), 10)

    def test_same_seed_same_order(self):
        """Same seed produces the same shuffled order across two calls."""
        bank = QuestionBank("test-cert", bank_root=self._root)
        run1 = [q["id"] for q in bank.get_questions(shuffle=True, seed=42)]
        run2 = [q["id"] for q in bank.get_questions(shuffle=True, seed=42)]
        self.assertEqual(run1, run2)

    def test_different_seeds_different_order(self):
        """Different seeds produce different shuffled orders."""
        bank = QuestionBank("test-cert", bank_root=self._root)
        run1 = [q["id"] for q in bank.get_questions(shuffle=True, seed=1)]
        run2 = [q["id"] for q in bank.get_questions(shuffle=True, seed=2)]
        self.assertNotEqual(run1, run2)

    def test_no_shuffle_preserves_order(self):
        """Without shuffle the returned order matches the bank order."""
        bank = QuestionBank("test-cert", bank_root=self._root)
        qs = bank.get_questions()
        ids = [q["id"] for q in qs]
        expected = [q["id"] for q in self._questions]
        self.assertEqual(ids, expected)

    def test_domains_property(self):
        """Domains property lists all distinct domain names in the bank."""
        bank = QuestionBank("test-cert", bank_root=self._root)
        self.assertIn("Domain A", bank.domains)
        self.assertIn("Domain B", bank.domains)

    def test_missing_bank_exits(self):
        """Loading a nonexistent cert slug exits with SystemExit."""
        with self.assertRaises(SystemExit):
            QuestionBank("nonexistent-cert", bank_root=self._root)


class TestCheckAnswer(unittest.TestCase):
    """Tests for the _check_answer helper."""

    def test_single_correct(self):
        """Matching single-letter answer returns True."""
        self.assertTrue(_check_answer("B", "B"))

    def test_single_incorrect(self):
        """Non-matching single-letter answer returns False."""
        self.assertFalse(_check_answer("A", "B"))

    def test_case_insensitive(self):
        """Answer matching is case-insensitive."""
        self.assertTrue(_check_answer("b", "B"))

    def test_whitespace_stripped(self):
        """Leading/trailing whitespace in the answer is stripped before comparison."""
        self.assertTrue(_check_answer(" B ", "B"))

    def test_multiselect_correct(self):
        """Comma-separated multi-select answer matching the correct set returns True."""
        self.assertTrue(_check_answer("B,D", ["B", "D"]))

    def test_multiselect_order_insensitive(self):
        """Multi-select comparison is order-independent."""
        self.assertTrue(_check_answer("D,B", ["B", "D"]))

    def test_multiselect_incomplete(self):
        """Submitting fewer answers than required returns False."""
        self.assertFalse(_check_answer("B", ["B", "D"]))

    def test_multiselect_extra(self):
        """Submitting extra answers beyond the correct set returns False."""
        self.assertFalse(_check_answer("A,B,D", ["B", "D"]))

    def test_multiselect_spaces_around_comma(self):
        """Spaces around commas in the answer string are handled correctly."""
        self.assertTrue(_check_answer("B, D", ["B", "D"]))


class TestFmtCorrect(unittest.TestCase):
    """Tests for the _fmt_correct helper."""

    def test_single(self):
        """Single-string correct answer is returned as-is."""
        self.assertEqual(_fmt_correct("C"), "C")

    def test_list(self):
        """List of correct answers is returned as a comma-separated string."""
        self.assertEqual(_fmt_correct(["A", "C"]), "A, C")


if __name__ == "__main__":
    unittest.main()
