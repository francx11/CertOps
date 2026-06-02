"""Tests for CustomViewerParser and merge_questions in scripts/ingest_html.py."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from ingest_html import CustomViewerParser, merge_questions

# ---------------------------------------------------------------------------
# HTML fixtures
# ---------------------------------------------------------------------------

_SINGLE_Q = """
<div class="question">
  <h2>Pregunta 1</h2>
  <p style="white-space: pre-wrap;">A company wants to classify images of animals using machine learning. Which algorithm meets these requirements best?</p>
  <pre style="white-space: pre-wrap;">A.. Decision trees
B.. Convolutional neural networks
C.. Linear regression
D.. K-means clustering</pre>
  <button onclick="revealAnswer(this)">Revelar respuesta</button>
  <div class="correct-answer" style="display:none;">
    Respuesta correcta: B
  </div>
</div>
"""

_MULTISELECT_Q = """
<div class="question">
  <h2>Pregunta 2</h2>
  <p style="white-space: pre-wrap;">Which two AWS services can be used to perform sentiment analysis on customer reviews? (Choose two.)</p>
  <pre style="white-space: pre-wrap;">A.. Amazon Lex
B.. Amazon Comprehend
C.. Amazon Polly
D.. Amazon Bedrock</pre>
  <button onclick="revealAnswer(this)">Revelar respuesta</button>
  <div class="correct-answer" style="display:none;">
    Respuesta correcta: BD
  </div>
</div>
"""

_HOTSPOT_Q = """
<div class="question">
  <h2>Pregunta 3</h2>
  <p style="white-space: pre-wrap;">HOTSPOT - Match the ML paradigm to each use case. <br><img src="https://example.com/q.png" alt="diagram"></p>
  <pre style="white-space: pre-wrap;">nan</pre>
  <button onclick="revealAnswer(this)">Revelar respuesta</button>
  <div class="correct-answer" style="display:none;">
    Respuesta correcta: [Image(s): https://example.com/a.png]
  </div>
</div>
"""

_MULTILINE_OPT_Q = """
<div class="question">
  <h2>Pregunta 4</h2>
  <p style="white-space: pre-wrap;">A company needs near real-time latency for large inputs up to 1 GB processing time. Which SageMaker inference option meets these requirements best?</p>
  <pre style="white-space: pre-wrap;">A.. Ensure that the role that Amazon Bedrock assumes has permission to decrypt
data with the correct encryption key.
B.. Set the access permissions for the S3 buckets to allow public access to enable
access over the internet.
C.. Use prompt engineering techniques.
D.. Ensure that the S3 data does not contain sensitive information.</pre>
  <button onclick="revealAnswer(this)">Revelar respuesta</button>
  <div class="correct-answer" style="display:none;">
    Respuesta correcta: A
  </div>
</div>
"""


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


class TestCustomViewerParser(unittest.TestCase):
    """Tests for the primary HTML parser (custom question-viewer format)."""

    def test_single_question_parsed(self):
        """A single-question HTML block yields exactly one parsed question."""
        p = CustomViewerParser(source="test.html", domain="General")
        p.feed(_SINGLE_Q)
        self.assertEqual(len(p.questions), 1)

    def test_question_fields_populated(self):
        """Parsed question has correct domain, source, options, ID, and added date."""
        p = CustomViewerParser(source="test.html", domain="ML Basics")
        p.feed(_SINGLE_Q)
        q = p.questions[0]
        self.assertEqual(q["correct"], "B")
        self.assertEqual(q["domain"], "ML Basics")
        self.assertEqual(q["source"], "test.html")
        self.assertIn("A", q["options"])
        self.assertIn("B", q["options"])
        self.assertIn("C", q["options"])
        self.assertIn("D", q["options"])
        self.assertRegex(q["id"], r"^[0-9a-f]{12}$")
        self.assertRegex(q["added"], r"^\d{4}-\d{2}-\d{2}$")

    def test_multiselect_correct_is_list(self):
        """Multi-select answer ('BD') is stored as a sorted list."""
        p = CustomViewerParser(source="test.html", domain="General")
        p.feed(_MULTISELECT_Q)
        self.assertEqual(len(p.questions), 1)
        q = p.questions[0]
        self.assertIsInstance(q["correct"], list)
        self.assertIn("B", q["correct"])
        self.assertIn("D", q["correct"])
        self.assertEqual(len(q["correct"]), 2)

    def test_hotspot_skipped(self):
        """HOTSPOT questions with 'nan' options are skipped and counted."""
        p = CustomViewerParser(source="test.html", domain="General")
        p.feed(_HOTSPOT_Q)
        self.assertEqual(len(p.questions), 0)
        self.assertEqual(p.skipped_hotspot, 1)

    def test_multiline_options_joined(self):
        """Multi-line option text is joined into a single string."""
        p = CustomViewerParser(source="test.html", domain="General")
        p.feed(_MULTILINE_OPT_Q)
        self.assertEqual(len(p.questions), 1)
        q = p.questions[0]
        # Option A should be a single joined string
        self.assertIn("Ensure", q["options"]["A"])
        self.assertIn("encryption key", q["options"]["A"])
        self.assertNotIn("\n", q["options"]["A"])

    def test_same_stem_produces_same_id(self):
        """Same question stem from different files produces the same stable ID."""
        p1 = CustomViewerParser(source="file1.html", domain="D1")
        p2 = CustomViewerParser(source="file2.html", domain="D2")
        p1.feed(_SINGLE_Q)
        p2.feed(_SINGLE_Q)
        self.assertEqual(p1.questions[0]["id"], p2.questions[0]["id"])

    def test_two_different_questions_different_ids(self):
        """Two different question stems produce different IDs."""
        html = _SINGLE_Q + _MULTISELECT_Q
        p = CustomViewerParser(source="test.html", domain="General")
        p.feed(html)
        self.assertEqual(len(p.questions), 2)
        self.assertNotEqual(p.questions[0]["id"], p.questions[1]["id"])

    def test_explanation_synthesized(self):
        """Explanation is synthesized and contains the correct answer letter."""
        p = CustomViewerParser(source="test.html", domain="General")
        p.feed(_SINGLE_Q)
        q = p.questions[0]
        self.assertIn("B", q["explanation"])
        self.assertGreater(len(q["explanation"]), 0)


class TestMergeQuestions(unittest.TestCase):
    """Tests for the merge_questions deduplication logic."""

    def _make_q(self, qid, stem="A question stem with enough text."):
        return {
            "id": qid,
            "domain": "General",
            "question": stem,
            "options": {"A": "Opt A", "B": "Opt B"},
            "correct": "A",
            "explanation": "A is correct.",
            "source": "test.html",
            "tags": [],
            "added": "2024-01-01",
        }

    def test_new_question_added(self):
        """A new unique question increments new_count and is added to the bank."""
        new_count, skipped, merged = merge_questions({}, [self._make_q("aaa111bbb222")])
        self.assertEqual(new_count, 1)
        self.assertEqual(skipped, 0)
        self.assertEqual(len(merged), 1)

    def test_duplicate_id_skipped(self):
        """A question with an already-existing ID is counted as skipped."""
        existing = {"aaa111bbb222": self._make_q("aaa111bbb222")}
        new_count, skipped, merged = merge_questions(existing, [self._make_q("aaa111bbb222")])
        self.assertEqual(new_count, 0)
        self.assertEqual(skipped, 1)
        self.assertEqual(len(merged), 1)

    def test_cross_file_duplicate_deduplicated(self):
        """Duplicate within the same ingest batch is also deduplicated."""
        q = self._make_q("aaa111bbb222")
        new_count, skipped, merged = merge_questions({}, [q, q])
        self.assertEqual(new_count, 1)
        self.assertEqual(skipped, 1)
        self.assertEqual(len(merged), 1)

    def test_merged_list_sorted_by_added(self):
        """Merged output is sorted by the 'added' date field."""
        q1 = self._make_q("aaa111bbb222")
        q1["added"] = "2024-03-01"
        q2 = self._make_q("ccc333ddd444")
        q2["added"] = "2024-01-01"
        _, _, merged = merge_questions({}, [q1, q2])
        self.assertEqual(merged[0]["id"], "ccc333ddd444")
        self.assertEqual(merged[1]["id"], "aaa111bbb222")


if __name__ == "__main__":
    unittest.main()
