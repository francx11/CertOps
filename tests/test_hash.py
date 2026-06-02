"""Tests for generate_id — SHA-256 based stable question ID generation."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from ingest_html import generate_id


class TestNormalization(unittest.TestCase):
    """Tests that generate_id normalizes text consistently before hashing."""

    def test_whitespace_variants_same_id(self):
        """Extra internal whitespace does not change the generated ID."""
        a = generate_id("A company wants to  build an ML model.")
        b = generate_id("A company wants to build an ML model.")
        self.assertEqual(a, b)

    def test_leading_trailing_whitespace(self):
        """Leading/trailing whitespace is stripped before hashing."""
        a = generate_id("  A company builds a model.  ")
        b = generate_id("A company builds a model.")
        self.assertEqual(a, b)

    def test_newlines_collapsed(self):
        """Newlines are collapsed to spaces before hashing."""
        a = generate_id("A company\nbuilds a model.")
        b = generate_id("A company builds a model.")
        self.assertEqual(a, b)

    def test_case_insensitive(self):
        """ID generation is case-insensitive."""
        a = generate_id("A Company Builds A Model.")
        b = generate_id("a company builds a model.")
        self.assertEqual(a, b)

    def test_smart_quotes_vs_ascii(self):
        """Smart quotes and ASCII apostrophes produce the same ID."""
        a = generate_id("The company's model.")
        b = generate_id("The company's model.")
        self.assertEqual(a, b)

    def test_html_entities_decoded(self):
        """HTML entities are decoded before hashing."""
        a = generate_id("A &amp; B comparison.")
        b = generate_id("A & B comparison.")
        self.assertEqual(a, b)

    def test_different_questions_different_ids(self):
        """Distinct question stems produce distinct IDs."""
        a = generate_id("What is machine learning for image recognition?")
        b = generate_id("What is deep learning for image recognition?")
        self.assertNotEqual(a, b)

    def test_id_is_12_hex_chars(self):
        """Generated ID is exactly 12 lowercase hex characters."""
        qid = generate_id("Some question text here and more words.")
        self.assertRegex(qid, r"^[0-9a-f]{12}$")

    def test_deterministic_across_calls(self):
        """Repeated calls with the same input always return the same ID."""
        q = "A company wants to use Amazon Bedrock for generative AI."
        self.assertEqual(generate_id(q), generate_id(q))


if __name__ == "__main__":
    unittest.main()
