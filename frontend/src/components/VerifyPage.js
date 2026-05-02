/*

import { useEffect, useState } from "react";

const SCENARIOS = {
  o_vs_0: { result: "caution", score: 90 },
  name_typo: { result: "caution", score: 82 },
  perfect: { result: "go", score: 100 },
  expired: { result: "stop", score: 0 },
  critical: { result: "stop", score: 12 },
};

export default function VerifyPage({ scenario }) {
  const [status, setStatus] = useState("processing");
  const [score, setScore] = useState(0);

  useEffect(() => {
    const data = SCENARIOS[scenario];

    setTimeout(() => {
      setStatus(data.result);
      setScore(data.score);
    }, 1500);
  }, [scenario]);

  return (
    <div className="page active">
      <h2>Verification Engine</h2>

      {status === "processing" && <p>Running AI checks...</p>}

      {status !== "processing" && (
        <>
          <h3>
            {status === "go" && "✅ CLEARED"}
            {status === "caution" && "⚠ AUTO-CORRECTED"}
            {status === "stop" && "❌ DENIED"}
          </h3>

          <p>Score: {score}</p>
        </>
      )}
    </div>
  );
}
  */

/*

import { useEffect, useState } from "react";

const API_URL =
  "https://exposed-zones-gently-fraction.trycloudflare.com/verify";

export default function VerifyPage({
  passportData,
  ticketData,
  result,
  setResult,
}) {
  const [loading, setLoading] = useState(false);

  const runVerification = async () => {
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          passport_text: passportData,
          ticket_text: ticketData,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Backend error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (passportData && ticketData) {
      runVerification();
    }
  }, []);

  return (
    <div className="page">
      <h2>Verification Engine</h2>

      {loading && <p>⏳ Running AI verification...</p>}

      {!loading && result && (
        <div className="result-box">
          <h3>Status: {result.status}</h3>
          <p>Score: {result.score}</p>

          {result.details && (
            <pre>{JSON.stringify(result.details, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}

*/

/*
import { useEffect, useState } from "react";

const API_URL =
  "https://exposed-zones-gently-fraction.trycloudflare.com/verify";

export default function VerifyPage({
  passportData,
  ticketData,
  result,
  setResult,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // prevent empty calls
    if (!passportData || !ticketData) return;

    const runVerification = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            passport_text: passportData,
            ticket_text: ticketData,
          }),
        });

        // handle non-200 responses
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        // store result safely
        setResult(data);
      } catch (err) {
        console.error("Verification error:", err);
        setError("Failed to verify. Check backend or network.");
      } finally {
        setLoading(false);
      }
    };

    runVerification();
  }, [passportData, ticketData, setResult]);

  return (
    <div className="page">
      <h2>Verification Engine</h2>

      {}
      {loading && <p>⏳ Running AI verification...</p>}

      {}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {}
      {!loading && !error && result && (
        <div className="result-box">
          <h3>Status: {result.status || "N/A"}</h3>
          <p>Score: {result.score ?? "N/A"}</p>

          {/}
          {result.details && (
            <div>
              <h4>Details:</h4>
              <pre>{JSON.stringify(result.details, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/}
      {!loading && !error && !result && (
        <p>No verification data yet.</p>
      )}
    </div>
  );
}
*/

import { useEffect, useState } from "react";

const API_URL =
  "https://exposed-zones-gently-fraction.trycloudflare.com/verify";

function parseFields(text) {
  if (!text) return {};
  const pairs = {};
  text.split("|").forEach((segment) => {
    const idx = segment.indexOf(":");
    if (idx !== -1) {
      const key = segment.slice(0, idx).trim();
      const val = segment.slice(idx + 1).trim();
      pairs[key] = val;
    }
  });
  return pairs;
}

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  if (s === "pass" || s === "approved" || s === "ok")
    return <span className="result-status-badge badge-pass">✓ APPROVED</span>;
  if (s === "warn" || s === "warning" || s === "review")
    return (
      <span className="result-status-badge badge-warn">⚠ REVIEW REQUIRED</span>
    );
  return <span className="result-status-badge badge-fail">✗ REJECTED</span>;
}

function getBadgeClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "pass" || s === "approved" || s === "ok") return "ok";
  if (s === "warn" || s === "warning") return "warn";
  return "fail";
}

export default function VerifyPage({
  passportData,
  ticketData,
  result,
  setResult,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!passportData || !ticketData) return;
    if (result) return; // already have result

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            passport_text: passportData,
            ticket_text: ticketData,
          }),
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        setResult(data);
      } catch (err) {
        console.error("Verification error:", err);
        setError(err.message || "Failed to connect to verification backend.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [passportData, ticketData]); // eslint-disable-line

  const passportFields = parseFields(passportData);
  const ticketFields = parseFields(ticketData);

  return (
    <div className="verify-page">
      <div className="section-label">Verification Engine</div>

      {/* Empty state */}
      {!passportData && !ticketData && (
        <div className="empty-state">
          <div style={{ fontSize: 40, marginBottom: 12 }}>🛂</div>
          <div>No data submitted yet.</div>
          <div style={{ marginTop: 8, color: "var(--text-dim)" }}>
            Go to UPLOAD tab and run AI Verification.
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="spinner-container">
          <div className="spinner" />
          <div className="spinner-text">Running AI verification...</div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="error-box">
          <div style={{ marginBottom: 8, fontWeight: 700 }}>
            ⚠ Backend Error
          </div>
          <div>{error}</div>
          <div
            style={{
              marginTop: 12,
              color: "var(--text-secondary)",
              fontSize: 11,
            }}
          >
            Check that your backend at {API_URL} is running and accessible.
          </div>
        </div>
      )}

      {/* Result */}
      {!loading && !error && result && (
        <div
          className="result-card"
          style={{ border: `1px solid var(--border-default)` }}
        >
          <div className="result-status-row">
            <StatusBadge status={result.status} />
            <div className="score-ring">
              {result.score !== undefined ? `${result.score}%` : "—"}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              Confidence Score
            </div>
          </div>

          {/* Field comparison table */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 80px",
              gap: "1px",
              background: "var(--border-default)",
              border: "1px solid var(--border-default)",
              borderRadius: 6,
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            {/* Header */}
            {["Field", "Passport", "Boarding Pass", "Match"].map((h) => (
              <div
                key={h}
                style={{
                  background: "var(--bg-input)",
                  padding: "8px 12px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: 1.5,
                  color: "var(--text-label)",
                  textTransform: "uppercase",
                }}
              >
                {h}
              </div>
            ))}

            {[
              ["Surname", passportFields.SURNAME, ticketFields.SURNAME],
              ["Given Names", passportFields.GIVEN, ticketFields.GIVEN],
              ["Doc Number", passportFields.DOC_NUM, ticketFields.DOC_NUM],
              [
                "Nationality",
                passportFields.NATIONALITY,
                ticketFields.NATIONALITY,
              ],
            ].map(([field, pVal, tVal]) => {
              const match =
                pVal &&
                tVal &&
                pVal.trim().toUpperCase() === tVal.trim().toUpperCase();
              return [
                <div
                  key={field + "_f"}
                  style={{
                    background: "var(--bg-card)",
                    padding: "10px 12px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--text-secondary)",
                  }}
                >
                  {field}
                </div>,
                <div
                  key={field + "_p"}
                  style={{
                    background: "var(--bg-card)",
                    padding: "10px 12px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--text-primary)",
                  }}
                >
                  {pVal || "—"}
                </div>,
                <div
                  key={field + "_t"}
                  style={{
                    background: "var(--bg-card)",
                    padding: "10px 12px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: match
                      ? "var(--text-primary)"
                      : "var(--accent-amber)",
                  }}
                >
                  {tVal || "—"}
                </div>,
                <div
                  key={field + "_m"}
                  style={{
                    background: "var(--bg-card)",
                    padding: "10px 12px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    color: match
                      ? "var(--accent-green)"
                      : "var(--accent-amber)",
                    textAlign: "center",
                  }}
                >
                  {match ? "✓" : "✗"}
                </div>,
              ];
            })}
          </div>

          {/* Details from backend */}
          {result.details && (
            <div className="result-detail-grid">
              {Object.entries(result.details).map(([k, v]) => (
                <div className="detail-item" key={k}>
                  <div className="detail-label">{k.replace(/_/g, " ")}</div>
                  <div
                    className={`detail-value ${
                      String(v).toLowerCase() === "pass" ||
                      String(v).toLowerCase() === "ok"
                        ? "ok"
                        : String(v).toLowerCase() === "fail"
                          ? "fail"
                          : ""
                    }`}
                  >
                    {String(v)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Raw JSON toggle */}
          <details
            style={{
              marginTop: 16,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-secondary)",
            }}
          >
            <summary style={{ cursor: "pointer", marginBottom: 8 }}>
              Raw JSON Response
            </summary>
            <pre
              style={{
                background: "var(--bg-input)",
                padding: 12,
                borderRadius: 6,
                overflowX: "auto",
                fontSize: 11,
                color: "var(--accent-cyan)",
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
