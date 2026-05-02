# VisaGuard AI Backend Plan (MVP)

## Tech stack
- **Framework**: Python + FastAPI
- **Validation engine**: Heuristic-based (regex parser)
- **AI integration**: None for MVP (no watsonx.ai yet)

## Implementation steps

### 1. FastAPI application setup
- Create `main.py` as the entrypoint
- Initialize the FastAPI app
- Configure CORS middleware for frontend integration

### 2. POST `/verify` endpoint
**Request**:
```json
{
  "passport_text": "string",
  "ticket_text": "string"
}
```

**Response**:
```json
{
  "riskLevel": "GO | CAUTION | STOP",
  "explanations": ["string"],
  "normalizedFields": {
    "passport": {...},
    "ticket": {...}
  },
  "diffs": [...]
}
```

### 3. Heuristic validation engine
**Rules**:
- **O vs 0 confusion detection** → `CAUTION`
  - Detect potential confusion between the letter 'O' and digit '0' in document numbers
  - Explanation: "Potential confusion between letter 'O' and digit '0' detected"

- **Expiry date check** → `STOP`
  - If passport expiry date is in the past
  - Explanation: "Passport has expired"

- **Field matching** → `GO` (or `CAUTION` if mismatched)
  - Compare key fields such as name, passport number, and date of birth
  - If all checked fields match, return `GO`

**Flow**:
```
Input text
  ↓
Regex parser (extract name, passport number, dates)
  ↓
Normalization (uppercase, remove spaces/separators)
  ↓
Apply heuristic rules
  ↓
Risk level decision + explanations
```

### 4. Response JSON structure
- `riskLevel`: final decision (`GO`/`CAUTION`/`STOP`)
- `explanations`: list of detected issues (human-readable)
- `normalizedFields`: extracted fields from passport/ticket
- `diffs`: field-level diffs between passport and ticket

### 5. MVP scope
- ✅ Simple regex-based parser
- ✅ Core heuristic rules (O/0, expiry, matching)
- ✅ JSON API response
- ❌ watsonx.ai integration (future phase)
- ❌ Persistence / database
- ❌ AuthN/AuthZ

## File structure
```
visaguard-backend/
├── main.py              # FastAPIエントリーポイント
├── models.py            # Pydanticモデル（リクエスト/レスポンス）
├── parser.py            # テキストパーサー（正規表現）
├── validator.py         # ヒューリスティック検証ロジック
└── requirements.txt     # 依存関係
```

## Next steps
1. Initialize the FastAPI project
2. Implement endpoint + models
3. Implement parser + heuristic validation logic
4. Local testing
5. Frontend integration