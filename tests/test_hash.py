import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from ingest_html import generate_id


class TestNormalization(unittest.TestCase):
    def test_whitespace_variants_same_id(self):
        a = generate_id("A company wants to  build an ML model.")
        b = generate_id("A company wants to build an ML model.")
        self.assertEqual(a, b)

    def test_leading_trailing_whitespace(self):
        a = generate_id("  A company builds a model.  ")
        b = generate_id("A company builds a model.")
        self.assertEqual(a, b)

    def test_newlines_collapsed(self):
        a = generate_id("A company\nbuilds a model.")
        b = generate_id("A company builds a model.")
        self.assertEqual(a, b)

    def test_case_insensitive(self):
        a = generate_id("A Company Builds A Model.")
        b = generate_id("a company builds a model.")
        self.assertEqual(a, b)

    def test_smart_quotes_vs_ascii(self):
        a = generate_id("The company’s model.")
        b = generate_id("The company's model.")
        self.assertEqual(a, b)

    def test_html_entities_decoded(self):
        a = generate_id("A &amp; B comparison.")
        b = generate_id("A & B comparison.")
        self.assertEqual(a, b)

    def test_different_questions_different_ids(self):
        a = generate_id("What is machine learning for image recognition?")
        b = generate_id("What is deep learning for image recognition?")
        self.assertNotEqual(a, b)

    def test_id_is_12_hex_chars(self):
        qid = generate_id("Some question text here and more words.")
        self.assertRegex(qid, r"^[0-9a-f]{12}$")

    def test_deterministic_across_calls(self):
        q = "A company wants to use Amazon Bedrock for generative AI."
        self.assertEqual(generate_id(q), generate_id(q))


if __name__ == "__main__":
    unittest.main()
