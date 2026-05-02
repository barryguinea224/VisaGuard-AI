import json
import os
import re
from datetime import datetime
from typing import Any, Dict, List

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables
load_dotenv()

app = FastAPI(title="VisaGuard AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VerifyRequest(BaseModel):
    passport_text: str
    ticket_text: str


class VerifyResponse(BaseModel):
    riskLevel: str
    explanations: List[str]
    normalizedFields: Dict[str, Any]
    diffs: List[str]


class ExtractResponse(BaseModel):
    extracted_text: str
    ai_raw_response: str = ""


def parse_text(text: str) -> Dict[str, Any]:
    """Extract fields from text using regex"""
    fields = {}

    # Extract name (common patterns)
    # Capture only the remainder of the line to avoid spanning into the next label (e.g., "PASSPORT")
    name_match = re.search(r"(?:name|名前|氏名)[:\s]+([^\n\r]+)", text, re.IGNORECASE)
    if name_match:
        fields["name"] = name_match.group(1).strip().upper()

    # Extract passport number (alphanumeric, typically 6-9 chars)
    passport_match = re.search(
        r"(?:passport|パスポート)[:\s#]*([A-Z0-9]{6,9})", text, re.IGNORECASE
    )
    if passport_match:
        fields["passport_number"] = passport_match.group(1).upper()

    # Extract date of birth (various formats)
    dob_match = re.search(
        r"(?:birth|生年月日|DOB)[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})",
        text,
        re.IGNORECASE,
    )
    if dob_match:
        fields["date_of_birth"] = dob_match.group(1)

    # Extract expiry date
    expiry_match = re.search(
        r"(?:expiry|有効期限|valid until)[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})",
        text,
        re.IGNORECASE,
    )
    if expiry_match:
        fields["expiry_date"] = expiry_match.group(1)

    # Extract MRZ if present
    mrz_match = re.search(r"(?:MRZ)[:\s]+([^\n\r]+)", text, re.IGNORECASE)
    if mrz_match:
        fields["mrz_text"] = mrz_match.group(1).replace(" ", "")
    else:
        # Fallback to look for MRZ-like sequences (lines with lots of '<')
        mrz_lines = re.findall(r"[A-Z0-9<]{20,}", text)
        if mrz_lines:
            fields["mrz_text"] = "".join(mrz_lines)

    return fields


def normalize_field(value: str) -> str:
    """Normalize field value"""
    if not value:
        return ""
    return value.upper().replace(" ", "").replace("-", "").replace("/", "")


def check_o_zero_confusion(text: str) -> bool:
    """Check for O vs 0 confusion in passport numbers or names"""
    # Look for patterns where O and 0 might be confused
    patterns = [
        r"[A-Z]*O[0-9]",  # Letter O followed by digit
        r"[0-9]O[A-Z]*",  # Digit followed by letter O
        r"[A-Z]*0[A-Z]+",  # Digit 0 in middle of letters
    ]
    for pattern in patterns:
        if re.search(pattern, text.upper()):
            return True
    return False


def parse_date(date_str: str) -> datetime:
    """Parse date string to datetime"""
    formats = ["%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y", "%m-%d-%Y", "%Y-%m-%d"]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    return None


def validate_documents(
    passport_fields: Dict[str, Any], ticket_fields: Dict[str, Any]
) -> VerifyResponse:
    """Apply heuristic validation rules"""
    risk_level = "GO"
    explanations = []
    diffs = []

    # Rule 1: Check for O vs 0 confusion
    passport_text = str(passport_fields.get("passport_number", ""))
    if check_o_zero_confusion(passport_text):
        risk_level = "CAUTION"
        explanations.append(
            "Potential confusion between letter 'O' and digit '0' detected"
        )

    # Rule 1.5: MRZ Cross-check
    mrz_text = str(passport_fields.get("mrz_text", ""))
    if mrz_text and passport_text:
        # MRZ uses '0' instead of 'O' for document numbers.
        expected_mrz_num = passport_text.replace("O", "0")
        if expected_mrz_num not in mrz_text and passport_text not in mrz_text:
            risk_level = "STOP"
            explanations.append(
                "MRZ Check Failed: Visual passport number does not match Machine Readable Zone"
            )
        else:
            explanations.append("MRZ Check Passed: Visual data matches MRZ")

    # Rule 2: Check expiry date
    expiry_str = passport_fields.get("expiry_date")
    if expiry_str:
        expiry_date = parse_date(expiry_str)
        if expiry_date and expiry_date < datetime.now():
            risk_level = "STOP"
            explanations.append("Passport has expired")

    # Rule 3: Field matching
    for field in ["name", "passport_number", "date_of_birth"]:
        passport_val = normalize_field(passport_fields.get(field, ""))
        ticket_val = normalize_field(ticket_fields.get(field, ""))

        if passport_val and ticket_val and passport_val != ticket_val:
            if risk_level == "GO":
                risk_level = "CAUTION"
            diffs.append(
                f"{field}: passport '{passport_fields.get(field)}' vs ticket '{ticket_fields.get(field)}'"
            )
            explanations.append(f"{field} does not match between passport and ticket")

    if not explanations:
        explanations.append("All checked fields match")

    return VerifyResponse(
        riskLevel=risk_level,
        explanations=explanations,
        normalizedFields={"passport": passport_fields, "ticket": ticket_fields},
        diffs=diffs,
    )


@app.post("/verify", response_model=VerifyResponse)
async def verify_documents(request: VerifyRequest):
    """Verify passport and ticket documents"""
    passport_fields = parse_text(request.passport_text)
    ticket_fields = parse_text(request.ticket_text)

    return validate_documents(passport_fields, ticket_fields)


# --- watsonx.ai Integration ---
def extract_with_watsonx(raw_text: str) -> str:
    """Use watsonx.ai to extract structured data from raw OCR text"""
    api_key = os.getenv("WATSONX_API_KEY")
    project_id = os.getenv("WATSONX_PROJECT_ID")
    url = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")

    if not api_key or not project_id or api_key == "your_ibm_cloud_api_key_here":
        return "ERROR: WATSONX credentials missing in .env"

    try:
        from ibm_watsonx_ai.foundation_models import Model
        from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams

        model_id = (
            "meta-llama/llama-3-8b-instruct"  # Choose a fast, instruction-tuned model
        )
        parameters = {
            GenParams.DECODING_METHOD: "greedy",
            GenParams.MAX_NEW_TOKENS: 100,
            GenParams.MIN_NEW_TOKENS: 1,
            GenParams.TEMPERATURE: 0.0,
        }

        model = Model(
            model_id=model_id,
            params=parameters,
            credentials={"url": url, "apikey": api_key},
            project_id=project_id,
        )

        prompt = f"""Extract the passport information from the following raw text.
Format the output EXACTLY as follows:
Name: [Name]
Passport: [Passport Number]
Expiry: [Expiry Date DD/MM/YYYY]
DOB: [DOB DD/MM/YYYY]
MRZ: [MRZ lines if present]

Raw Text:
{raw_text}

Extracted Information:"""

        generated_response = model.generate_text(prompt=prompt)
        return generated_response.strip()

    except Exception as e:
        return f"watsonx API Error: {str(e)}"


@app.post("/extract", response_model=ExtractResponse)
async def extract_text(file: UploadFile = File(...)):
    """
    Extracts text using watsonx.ai.
    For the MVP demo, we use a hardcoded raw OCR string to represent the image,
    and then pass it through the watsonx.ai model to structure it.
    """
    filename = file.filename.lower() if file.filename else ""

    # 1. Simulate raw, messy OCR output from the image
    if "ticket" in filename or "booking" in filename:
        raw_ocr = "Passenger Name is BARRY ELHADJ. PNR is XYZ123. Document num is P1230456, DOB is 15th March 1990."
    else:
        # The Guinean Passport Demo Case
        raw_ocr = "REPUBLIQUE DE GUINEE PASSEPORT BARRY ELHADJ P123O456 Valid Until 20/12/2030 Date of birth 15/03/1990\nP<GINBARRY<<ELHADJ<<<<<<<<<<<<<<<<<<<<<<\nP1230456<9GIN9003158M3012204<<<<<<<<<<<<<<08"

    # 2. Use watsonx.ai to clean and structure the text
    # NOTE: If API keys are not set, it will return the mock string so the demo doesn't break.
    if (
        os.getenv("WATSONX_API_KEY")
        and os.getenv("WATSONX_API_KEY") != "your_ibm_cloud_api_key_here"
    ):
        structured_text = extract_with_watsonx(raw_ocr)
        ai_response = "Processed via watsonx.ai: meta-llama/llama-3-8b-instruct"
    else:
        # Fallback for local testing without keys
        if "ticket" in filename or "booking" in filename:
            structured_text = "Name: BARRY ELHADJ\nPassport: P1230456\nDOB: 15/03/1990"
        else:
            structured_text = "Name: BARRY ELHADJ\nPassport: P123O456\nExpiry: 20/12/2030\nDOB: 15/03/1990\nMRZ: P1230456<9GIN9003158M3012204"
        ai_response = "Mocked (No API Key)"

    return ExtractResponse(extracted_text=structured_text, ai_raw_response=ai_response)


@app.get("/")
async def root():
    return {"message": "VisaGuard AI Backend", "status": "running"}


# Made with Bob and watsonx.ai
