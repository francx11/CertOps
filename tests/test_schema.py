"""Tests for the JSON schema validation of question bank entries."""

import json
import unittest
from pathlib import Path

try:
    import jsonschema

    JSONSCHEMA_AVAILABLE = True
except ImportError:
    JSONSCHEMA_AVAILABLE = False

SCHEMA_PATH = Path(__file__).resolve().parent.parent / "core" / "schema.json"


def _load_schema():
    return json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))


def _valid_q(**overrides):
    q = {
        "id": "abc123def456",
        "domain": "Domain 1",
        "question": "What is the correct answer to this question?",
        "options": {"A": "First option", "B": "Second option", "C": "Third", "D": "Fourth"},
        "correct": "B",
        "explanation": "B is correct because it is the right answer.",
        "source": "test.html",
        "tags": ["ml", "aws"],
        "added": "2024-06-01",
    }
    q.update(overrides)
    return q


@unittest.skipUnless(JSONSCHEMA_AVAILABLE, "jsonschema not installed — run: pip install jsonschema")
class TestSchema(unittest.TestCase):
    """Tests that valid questions pass and invalid questions fail JSON schema validation."""

    def setUp(self):
        """Load the question bank JSON schema from disk."""
        self.schema = _load_schema()

    def _validate(self, data):
        jsonschema.validate(instance=data, schema=self.schema)

    def _assert_fails(self, data):
        with self.assertRaises(jsonschema.ValidationError):
            self._validate(data)

    # -- Valid cases ---------------------------------------------------------

    def test_valid_single_question(self):
        """A fully valid question passes schema validation."""
        self._validate([_valid_q()])

    def test_valid_empty_bank(self):
        """An empty bank array passes schema validation."""
        self._validate([])

    def test_valid_multiselect_correct(self):
        """A question with a multi-select correct list passes validation."""
        self._validate([_valid_q(correct=["B", "D"])])

    def test_valid_five_options(self):
        """A question with five answer options passes validation."""
        q = _valid_q()
        q["options"]["E"] = "Fifth option"
        self._validate([q])

    def test_valid_six_options(self):
        """A question with six answer options passes validation."""
        q = _valid_q()
        q["options"]["E"] = "Fifth option"
        q["options"]["F"] = "Sixth option"
        self._validate([q])

    def test_valid_empty_tags(self):
        """A question with an empty tags array passes validation."""
        self._validate([_valid_q(tags=[])])

    # -- Invalid id ----------------------------------------------------------

    def test_invalid_id_11_chars(self):
        """An ID shorter than 12 characters fails validation."""
        self._assert_fails([_valid_q(id="abc123def45")])

    def test_invalid_id_13_chars(self):
        """An ID longer than 12 characters fails validation."""
        self._assert_fails([_valid_q(id="abc123def4567")])

    def test_invalid_id_uppercase(self):
        """An ID with uppercase letters fails validation."""
        self._assert_fails([_valid_q(id="ABC123DEF456")])

    def test_invalid_id_non_hex(self):
        """An ID containing non-hex characters fails validation."""
        self._assert_fails([_valid_q(id="xyz123abc456")])

    # -- Invalid options -----------------------------------------------------

    def test_invalid_options_key_G(self):
        """An options key beyond F (e.g. G) fails validation."""
        q = _valid_q()
        q["options"]["G"] = "Invalid key"
        self._assert_fails([q])

    def test_invalid_options_one_entry(self):
        """A question with only one option fails validation."""
        self._assert_fails([_valid_q(options={"A": "Only one"})])

    def test_invalid_options_seven_entries(self):
        """A question with seven options fails validation."""
        q = _valid_q()
        for k in "ABCDEFG":
            q["options"][k] = f"Option {k}"
        self._assert_fails([q])

    # -- Invalid correct -----------------------------------------------------

    def test_invalid_correct_G(self):
        """A correct value of 'G' (beyond F) fails validation."""
        self._assert_fails([_valid_q(correct="G")])

    def test_invalid_correct_lowercase(self):
        """A lowercase correct value fails validation."""
        self._assert_fails([_valid_q(correct="b")])

    def test_invalid_correct_single_item_list(self):
        """A correct list with only one item fails validation."""
        self._assert_fails([_valid_q(correct=["B"])])

    def test_invalid_correct_duplicate_in_list(self):
        """A correct list with duplicate items fails validation."""
        self._assert_fails([_valid_q(correct=["B", "B"])])

    # -- Invalid dates -------------------------------------------------------

    def test_invalid_added_bad_month(self):
        """An added date with an invalid month fails validation."""
        self._assert_fails([_valid_q(added="2024-13-01")])

    def test_invalid_added_format(self):
        """An added date in the wrong format fails validation."""
        self._assert_fails([_valid_q(added="01/06/2024")])

    # -- Missing required fields ---------------------------------------------

    def test_missing_id(self):
        """A question missing the id field fails validation."""
        q = _valid_q()
        del q["id"]
        self._assert_fails([q])

    def test_missing_question(self):
        """A question missing the question field fails validation."""
        q = _valid_q()
        del q["question"]
        self._assert_fails([q])

    def test_missing_correct(self):
        """A question missing the correct field fails validation."""
        q = _valid_q()
        del q["correct"]
        self._assert_fails([q])

    # -- Extra fields --------------------------------------------------------

    def test_extra_field_rejected(self):
        """A question with an extra unknown field fails validation."""
        q = _valid_q()
        q["extra_field"] = "not allowed"
        self._assert_fails([q])

    # -- Question length -----------------------------------------------------

    def test_question_too_short(self):
        """A question stem shorter than 10 characters fails validation."""
        self._assert_fails([_valid_q(question="Too short")])


if __name__ == "__main__":
    unittest.main()
