# Written Statement on Technology: How We Used IBM Bob and watsonx.ai

## 1. IBM Bob IDE: Strategic Architecture & Efficiency
We utilized IBM Bob IDE as our primary development partner to rapidly architect and build our Python/FastAPI backend. Knowing that token efficiency is critical, we adopted a strict constraint-based workflow. We first used Bob's `/plan` mode to outline our Heuristic Validation Engine—specifically defining the "O vs 0" correction logic and our JSON API contracts. Once the plan was locked in, we used `/code` to generate the exact implementation. This strategic prompting allowed us to build the entire backend MVP, complete with CORS middleware, validation logic, and a full `pytest` suite, using only 1.04 Bobcoins (97% of our budget remaining). 

## 2. IBM Bob Shell: Autonomous Test Repair
Beyond initial code generation, we leveraged **Bob Shell** directly in our terminal as an autonomous debugging agent. During the final integration phase, our automated `pytest` suite failed because of a nuanced update to our business logic: the Machine Readable Zone (MRZ) cross-check needed to output a "CAUTION" (fixable typo) rather than a hard "STOP" when safely correcting the Guinean passport 'O' to '0'. 

Instead of manually rewriting the tests, we invoked Bob Shell. Bob autonomously ran the test suite, parsed the error output, understood the new business rule, and self-corrected the assertions in `test_main.py` using the `--yolo` flag. This demonstrated Bob's capability not just as a coding assistant, but as a full-lifecycle engineering partner.

## 3. IBM watsonx.ai: Precision Extraction
To fulfill our vision of a "Digital Gatekeeper," we integrated IBM watsonx.ai into our `POST /extract` pipeline. Standard document scanners often output messy, unstructured raw text. To bridge this gap, we implemented the `ibm-watsonx-ai` Python SDK to call the `meta-llama/llama-3-8b-instruct` foundation model. 

Rather than relying on brittle regex to understand complex passenger data, we use the LLM as an intelligent parser. It takes the raw OCR string from a scanned passport or boarding pass and dynamically formats it into a strict, structured JSON payload (Name, Document Number, DOB, Expiry, MRZ). This highly structured data is then fed into our Heuristic Correction Engine, ensuring that VisaGuard AI's decisions are powered by true enterprise AI.