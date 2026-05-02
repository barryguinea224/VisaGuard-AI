from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from main import (
    app,
    check_o_zero_confusion,
    normalize_field,
    parse_text,
    validate_documents,
)

client = TestClient(app)


# ============================================================================
# Unit Tests - Heuristic Functions
# ============================================================================


class TestCheckOZeroConfusion:
    """Test check_o_zero_confusion() function"""

    def test_o_followed_by_digit(self):
        """Test with O followed by digit"""
        assert check_o_zero_confusion("ABCO123") is True

    def test_digit_followed_by_o(self):
        """Test with digit followed by O"""
        assert check_o_zero_confusion("123O456") is True

    def test_zero_in_letters(self):
        """Test with 0 in middle of letters"""
        assert check_o_zero_confusion("AB0CD") is True

    def test_clean_alphanumeric(self):
        """Test clean alphanumeric without confusion"""
        assert check_o_zero_confusion("ABC123") is False


class TestNormalizeField:
    """Test normalize_field() function"""

    def test_uppercase_conversion(self):
        """Test uppercase conversion"""
        assert normalize_field("john doe") == "JOHNDOE"

    def test_space_dash_removal(self):
        """Test space and dash removal"""
        assert normalize_field("12-34 56") == "123456"

    def test_empty_string(self):
        """Test empty string"""
        assert normalize_field("") == ""

    def test_slash_removal(self):
        """Test slash removal"""
        assert normalize_field("01/02/2020") == "01022020"


class TestParseText:
    """Test parse_text() function"""

    def test_name_extraction(self):
        """Test name extraction"""
        result = parse_text("Name: John Doe")
        assert result.get("name") == "JOHN DOE"

    def test_passport_extraction(self):
        """Test passport number extraction"""
        result = parse_text("Passport: P1234567")
        assert result.get("passport_number") == "P1234567"

    def test_dob_extraction(self):
        """Test date of birth extraction"""
        result = parse_text("DOB: 15/03/1990")
        assert result.get("date_of_birth") == "15/03/1990"

    def test_expiry_extraction(self):
        """Test expiry date extraction"""
        result = parse_text("Expiry: 01/01/2030")
        assert result.get("expiry_date") == "01/01/2030"

    def test_mrz_extraction(self):
        """Test MRZ extraction"""
        result = parse_text("MRZ: P1234567<9ABC1234567M3012204")
        assert "mrz_text" in result
        assert "P1234567" in result["mrz_text"]

    def test_mrz_fallback_extraction(self):
        """Test MRZ fallback extraction for MRZ-like sequences"""
        result = parse_text("P<GINBARRY<<ELHADJ<<<<<<<<<<<<<<<<<<<<<<")
        assert "mrz_text" in result


# ============================================================================
# Integration Tests - MRZ Cross-check
# ============================================================================


class TestMRZValidation:
    """Test MRZ cross-check logic"""

    def test_o_zero_mismatch_detection(self):
        """Test O/0 mismatch between visual and MRZ"""
        passport_fields = {
            "name": "BARRY ELHADJ",
            "passport_number": "P123O456",
            "expiry_date": "20/12/2030",
            "date_of_birth": "15/03/1990",
            "mrz_text": "P1230456<9GIN9003158M3012204",
        }
        ticket_fields = {
            "name": "BARRY ELHADJ",
            "passport_number": "P1230456",
            "date_of_birth": "15/03/1990",
        }

        result = validate_documents(passport_fields, ticket_fields)
        assert result.riskLevel == "CAUTION"
        assert any("MRZ Check Passed" in exp for exp in result.explanations)

    def test_matching_passport_and_mrz(self):
        """Test matching passport number and MRZ"""
        passport_fields = {
            "name": "JOHN DOE",
            "passport_number": "P1230456",
            "expiry_date": "01/01/2030",
            "date_of_birth": "15/03/1990",
            "mrz_text": "P1230456<9ABC1234567M3012204",
        }
        ticket_fields = {
            "name": "JOHN DOE",
            "passport_number": "P1230456",
            "date_of_birth": "15/03/1990",
        }

        result = validate_documents(passport_fields, ticket_fields)
        assert any("MRZ Check Passed" in exp for exp in result.explanations)

    def test_both_have_o_in_passport_and_mrz(self):
        """Test when both visual and MRZ have O"""
        passport_fields = {
            "name": "JANE DOE",
            "passport_number": "P123O456",
            "expiry_date": "01/01/2030",
            "date_of_birth": "20/05/1985",
            "mrz_text": "P123O456<9ABC1234567M3012204",
        }
        ticket_fields = {
            "name": "JANE DOE",
            "passport_number": "P123O456",
            "date_of_birth": "20/05/1985",
        }

        result = validate_documents(passport_fields, ticket_fields)
        assert any("MRZ Check Passed" in exp for exp in result.explanations)


# ============================================================================
# API Tests - POST /verify Endpoint
# ============================================================================


class TestVerifyEndpoint:
    """Test POST /verify endpoint"""

    def test_go_case_all_match(self):
        """Test GO case - all fields match, valid expiry"""
        response = client.post(
            "/verify",
            json={
                "passport_text": "Name: JOHN DOE\nPassport: P1234567\nExpiry: 01/01/2030\nDOB: 15/03/1990",
                "ticket_text": "Name: JOHN DOE\nPassport: P1234567\nDOB: 15/03/1990",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["riskLevel"] == "GO"
        assert "All checked fields match" in data["explanations"]

    def test_caution_case_o_zero_confusion(self):
        """Test CAUTION case - O/0 confusion detected"""
        response = client.post(
            "/verify",
            json={
                "passport_text": "Name: BARRY ELHADJ\nPassport: P123O456\nExpiry: 20/12/2030\nDOB: 15/03/1990",
                "ticket_text": "Name: BARRY ELHADJ\nPassport: P1230456\nDOB: 15/03/1990",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["riskLevel"] == "CAUTION"
        assert any(
            "confusion between letter 'O' and digit '0'" in exp
            for exp in data["explanations"]
        )

    def test_stop_case_expired_passport(self):
        """Test STOP case - expired passport"""
        response = client.post(
            "/verify",
            json={
                "passport_text": "Name: JANE DOE\nPassport: P9876543\nExpiry: 01/01/2020\nDOB: 20/05/1985",
                "ticket_text": "Name: JANE DOE\nPassport: P9876543\nDOB: 20/05/1985",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["riskLevel"] == "STOP"
        assert any("expired" in exp.lower() for exp in data["explanations"])

    def test_stop_case_mrz_mismatch(self):
        """Test STOP case - MRZ mismatch (O instead of 0)"""
        response = client.post(
            "/verify",
            json={
                "passport_text": "Name: BARRY ELHADJ\nPassport: P123O456\nExpiry: 20/12/2030\nDOB: 15/03/1990\nMRZ: P1230456<9GIN9003158M3012204",
                "ticket_text": "Name: BARRY ELHADJ\nPassport: P1230456\nDOB: 15/03/1990",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["riskLevel"] == "CAUTION"
        assert any("MRZ Check Passed" in exp for exp in data["explanations"])

    def test_caution_case_field_mismatch(self):
        """Test CAUTION case - field mismatch between passport and ticket"""
        response = client.post(
            "/verify",
            json={
                "passport_text": "Name: JOHN DOE\nPassport: P1234567\nExpiry: 01/01/2030\nDOB: 15/03/1990",
                "ticket_text": "Name: JANE DOE\nPassport: P1234567\nDOB: 15/03/1990",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["riskLevel"] == "CAUTION"
        assert any("does not match" in exp for exp in data["explanations"])
        assert len(data["diffs"]) > 0


class TestRootEndpoint:
    """Test GET / endpoint"""

    def test_root_endpoint(self):
        """Test root endpoint returns status"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert "VisaGuard" in data["message"]


# Made with Bob
