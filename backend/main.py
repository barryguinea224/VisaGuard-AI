from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
import re

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


def parse_text(text: str) -> Dict[str, Any]:
    """Extract fields from text using regex"""
    fields = {}
    
    # Extract name (common patterns)
    # Capture only the remainder of the line to avoid spanning into the next label (e.g., "PASSPORT")
    name_match = re.search(r'(?:name|名前|氏名)[:\s]+([^\n\r]+)', text, re.IGNORECASE)
    if name_match:
        fields['name'] = name_match.group(1).strip().upper()
    
    # Extract passport number (alphanumeric, typically 6-9 chars)
    passport_match = re.search(r'(?:passport|パスポート)[:\s#]*([A-Z0-9]{6,9})', text, re.IGNORECASE)
    if passport_match:
        fields['passport_number'] = passport_match.group(1).upper()
    
    # Extract date of birth (various formats)
    dob_match = re.search(r'(?:birth|生年月日|DOB)[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})', text, re.IGNORECASE)
    if dob_match:
        fields['date_of_birth'] = dob_match.group(1)
    
    # Extract expiry date
    expiry_match = re.search(r'(?:expiry|有効期限|valid until)[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})', text, re.IGNORECASE)
    if expiry_match:
        fields['expiry_date'] = expiry_match.group(1)
    
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
        r'[A-Z]*O[0-9]',  # Letter O followed by digit
        r'[0-9]O[A-Z]*',  # Digit followed by letter O
        r'[A-Z]*0[A-Z]+', # Digit 0 in middle of letters
    ]
    for pattern in patterns:
        if re.search(pattern, text.upper()):
            return True
    return False


def parse_date(date_str: str) -> datetime:
    """Parse date string to datetime"""
    formats = ['%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y', '%m-%d-%Y', '%Y-%m-%d']
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    return None


def validate_documents(passport_fields: Dict[str, Any], ticket_fields: Dict[str, Any]) -> VerifyResponse:
    """Apply heuristic validation rules"""
    risk_level = "GO"
    explanations = []
    diffs = []
    
    # Rule 1: Check for O vs 0 confusion
    passport_text = str(passport_fields.get('passport_number', ''))
    if check_o_zero_confusion(passport_text):
        risk_level = "CAUTION"
        explanations.append("Potential confusion between letter 'O' and digit '0' detected")
    
    # Rule 2: Check expiry date
    expiry_str = passport_fields.get('expiry_date')
    if expiry_str:
        expiry_date = parse_date(expiry_str)
        if expiry_date and expiry_date < datetime.now():
            risk_level = "STOP"
            explanations.append("Passport has expired")
    
    # Rule 3: Field matching
    for field in ['name', 'passport_number', 'date_of_birth']:
        passport_val = normalize_field(passport_fields.get(field, ''))
        ticket_val = normalize_field(ticket_fields.get(field, ''))
        
        if passport_val and ticket_val and passport_val != ticket_val:
            if risk_level == "GO":
                risk_level = "CAUTION"
            diffs.append(f"{field}: パスポート '{passport_fields.get(field)}' vs チケット '{ticket_fields.get(field)}'")
            diffs[-1] = diffs[-1].replace("パスポート", "passport").replace("チケット", "ticket")
            explanations.append(f"{field} does not match between passport and ticket")
    
    if not explanations:
        explanations.append("All checked fields match")
    
    return VerifyResponse(
        riskLevel=risk_level,
        explanations=explanations,
        normalizedFields={
            "passport": passport_fields,
            "ticket": ticket_fields
        },
        diffs=diffs
    )


@app.post("/verify", response_model=VerifyResponse)
async def verify_documents(request: VerifyRequest):
    """Verify passport and ticket documents"""
    passport_fields = parse_text(request.passport_text)
    ticket_fields = parse_text(request.ticket_text)
    
    return validate_documents(passport_fields, ticket_fields)

@app.post("/extract", response_model=ExtractResponse)
async def extract_text(file: UploadFile = File(...)):
    """
    MVP extraction endpoint.
    For hackathon demo reliability, this returns a deterministic mock output that simulates OCR extraction.
    This is designed to be swapped with a real watsonx.ai OCR pipeline later.
    """
    _ = file  # file is accepted to match the frontend contract
    mock_extracted = (
        "Name: BARRY ELHADJ\n"
        "Passport: P123O456\n"
        "Expiry: 20/12/2030\n"
        "DOB: 15/03/1990\n"
    )
    return ExtractResponse(extracted_text=mock_extracted)


@app.get("/")
async def root():
    return {"message": "VisaGuard AI Backend", "status": "running"}

# Made with Bob
