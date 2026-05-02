# VisaGuard AI – Problem & Solution Statement

## Problem:
Millions of travellers each year face “Denied Boarding” (DNB) due to small but critical data inconsistencies between their passport and travel documents. These errors are often minor such as confusing characters like “O” and “0,” slight name mismatches, or passports expiring within six months of travel. Current airline and verification systems only scan documents; they do not interpret or intelligently validate them. As a result, travellers are only made aware of these issues at the airport, leading to missed flights, financial losses, and significant stress. This gap highlights the need for a proactive, intelligent verification system that can detect and resolve such issues before travel.

## Solution:
VisaGuard AI is an intelligent, AI powered “Digital Gatekeeper” designed to prevent denied boarding incidents by identifying and correcting document inconsistencies in real time. The system is built for travellers, airlines, and travel agencies who want a fast, reliable way to validate travel documents before departure.

Users interact with VisaGuard AI through a simple, three step interface:
* **Upload/Input:** Users enter or upload passport and ticket details.
* **Verification:** The system analyses the data using AI powered logic.
* **Result Dashboard:** Users receive a clear status GO, CAUTION, or STOP along with explanations and suggested corrections.

## Core Innovation
Unlike traditional systems, VisaGuard AI does not just extract data it *thinks*. It applies a unique “Logic Layer” that includes:
* **Alphanumeric Guard:** Detects and auto-corrects common character mismatches (e.g., “O” vs “0”), especially in region specific formats, by cross-referencing visual text against the Machine Readable Zone (MRZ).
* **6-Month Sentinel:** Instantly flags passports that do not meet international validity rules.
* **Identity Bridge:** Cross checks names across multiple document fields to ensure consistency.

This intelligent validation transforms raw data into actionable insights, preventing issues before they occur.

## Why It’s Unique
VisaGuard AI introduces a proactive, reasoning-based approach to travel verification something current systems lack. Instead of reacting to errors at the airport, it anticipates and resolves them in advance. Built rapidly using AI assisted development tools, the system demonstrates how intelligent automation can reduce human error, improve efficiency, and enhance user confidence.

## Impact
By eliminating preventable document errors, VisaGuard AI saves travellers from costly disruptions and improves the overall travel experience. It is a scalable solution that can redefine how document verification is handled globally shifting from passive scanning to intelligent decision-making.

---

# Written Statement on Technology (How we used IBM Bob & watsonx.ai)

We used IBM Bob IDE as our primary development partner to rapidly build a robust Python/FastAPI backend. We adopted an extreme-efficiency approach, using Bob's `/plan` mode to strictly architect the Heuristic Validation Engine and MRZ logic before generating code. When an edge-case bug was found in our `pytest` suite, we used **Bob Shell** as an autonomous agent to run the tests, parse the error outputs, and self-correct the assertions. This strategic prompting allowed us to build the entire MVP—including comprehensive 100% test coverage—using less than 2 Bobcoins (97% budget remaining), demonstrating extreme development efficiency.

Furthermore, we successfully integrated IBM watsonx.ai into our `POST /extract` "Precision Extraction" pipeline. We use the `meta-llama/llama-3-8b-instruct` foundation model via the `ibm-watsonx-ai` SDK. Instead of relying on rigid regex for messy document scans, we use the LLM to intelligently parse and structure raw OCR data into clean JSON before feeding it into our Heuristic Engine. This ensures our "Zero-Friction Travel" vision is powered by true enterprise AI.