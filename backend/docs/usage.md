# VisaGuard AI Backend - Usage

## Setup

1. Create virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

### Optional: Recommended Setup (Using `uv` to pin Python 3.13)
If you encounter issues with Python 3.14 (e.g., `pydantic-core` build failures), use `uv` to create a Python 3.13 virtualenv:

```bash
uv python install 3.13
uv venv --python 3.13 .venv
source .venv/bin/activate
uv pip install -r requirements.txt
```

## Run Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at: `http://localhost:8000`

## API Documentation

Interactive API docs: `http://localhost:8000/docs`

## Extraction (Image Upload) - MVP Mock

For demo reliability, the backend includes an MVP `POST /extract` endpoint that accepts an image upload and returns a deterministic mock OCR output (designed to be replaced with watsonx.ai OCR later).

```bash
curl -X POST "http://localhost:8000/extract" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@./demo_assets/Guinean-mercenary-1.jpg"
```

## Example Request

```bash
curl -X POST "http://localhost:8000/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "passport_text": "Name: JOHN DOE\nPassport: AB1234567\nDate of Birth: 15/03/1990\nExpiry: 20/12/2030",
    "ticket_text": "Passenger: JOHN DOE\nPassport: AB1234567\nDOB: 15/03/1990"
  }'
```

## Response Format

```json
{
  "riskLevel": "GO",
  "explanations": ["All checked fields match"],
  "normalizedFields": {
    "passport": {
      "name": "JOHN DOE",
      "passport_number": "AB1234567",
      "date_of_birth": "15/03/1990",
      "expiry_date": "20/12/2030"
    },
    "ticket": {
      "name": "JOHN DOE",
      "passport_number": "AB1234567",
      "date_of_birth": "15/03/1990"
    }
  },
  "diffs": []
}
```

## Risk Levels

- **GO**: All fields match, no issues detected
- **CAUTION**: Potential O/0 confusion or minor mismatches
- **STOP**: Expired passport or critical mismatches