# 📌 VisaGuard AI – QA & Validation Dashboard
## 🚀 Project Overview
**VisaGuard AI** is a context-aware identity verification system designed to eliminate document mismatch errors in airline boarding workflows. 
A common real-world issue is the confusion between visually similar characters, specifically:
* **Letter ‘O’**
* **Number ‘0’**
This system intelligently resolves such discrepancies using AI, reducing false rejections and significantly improving operational efficiency.
---
## 🎯 Objectives
* **Detect & Resolve:** Specifically target O vs 0 mismatches.
* **Prevent False Rejections:** Reduce friction for legitimate passengers.
* **Fraud Detection:** Maintain strict validation for genuine security threats.
* **AI Decision Making:** Provide confidence-based automated decisions.
* **Insights:** Deliver real-time dashboard analytics for operations.
---
## 🧪 Test Strategy Summary
### Test Categories
* ✅ **Positive Cases:** Valid matches and minor character variations.
* ❌ **Negative Cases:** Invalid inputs and security mismatches.
* ⚠️ **Edge Cases:** Complex patterns and unusual document formats.
### Testing Techniques Applied
* Equivalence Partitioning
* Boundary Value Analysis
* Decision Table Testing
* Scenario-Based Testing
---
## 📊 Test Execution Summary

| Metric | Value |
| :--- | :--- |
| **Total Tests Executed** | 7 |
| **Total Passed** | 7 |
| **Total Failed** | 0 |
| **Pass Rate (%)** | 100% |
| **Average Confidence Score** | 97.57% |

---
## 🧩 Sample Test Cases

| Test ID | Scenario | Result | Confidence |
| :--- | :--- | :--- | :--- |
| **P1** | O vs 0 mismatch | PASS | 94% |
| **P2** | Exact match | PASS | 99% |
| **P3** | Name match | PASS | 99% |
| **P4** | Complex pattern | PASS | 91% |
| **P5** | Perfect match | PASS | 100% |
| **P6** | Expired document | PASS | 100% |
| **P7** | Fraud mismatch | PASS | 100% |

---
## 🧠 AI Decision Model

| Confidence Score | Decision |
| :--- | :--- |
| **90–100%** | Auto Accept |
| **80–89%** | Accept with Warning |
| **<80%** | Reject |

---
## ⚙️ Tech Stack
* **AI-based Validation Engine:** Context-aware resolution logic.
* **Excel Dashboard:** Comprehensive QA metrics and visual graphs.
* **Automation-ready Structure:** Designed for CI/CD integration.
---
## 📁 Project Structure
```text
VisaGuard-AI/
├── TestCases.xlsx
├── Dashboard.xlsx
├── TestStrategy.docx
├── TestClosureReport.docx
└── README.md
