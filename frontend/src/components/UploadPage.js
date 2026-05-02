/*

const scenarios = {
  o_vs_0: "O vs 0 mismatch",
  name_typo: "Name typo",
  perfect: "Perfect match",
  expired: "Expired passport",
  critical: "Critical mismatch",
};

export default function UploadPage({ setPage, scenario, setScenario }) {
  return (
    <div className="page active">
      <h2>Select Scenario</h2>

      <div className="scenario-bar">
        {Object.keys(scenarios).map((key) => (
          <button
            key={key}
            className={`sc-btn ${scenario === key ? "selected" : ""}`}
            onClick={() => setScenario(key)}
          >
            {scenarios[key]}
          </button>
        ))}
      </div>

      <button
        className="big-btn"
        onClick={() => setPage("verify")}
        style={{ marginTop: "20px" }}
      >
        ⚡ Run AI Verification
      </button>
    </div>
  );
}
  */

/*

import { useState } from "react";

export default function UploadPage({
  setPage,
  setPassportData,
  setTicketData,
}) {
  const [passport, setPassport] = useState("");
  const [ticket, setTicket] = useState("");

  const handleSubmit = () => {
    if (!passport || !ticket) {
      alert("Please fill both fields");
      return;
    }

    setPassportData(passport);
    setTicketData(ticket);
    setPage("verify");
  };

  return (
    <div className="page">
      <h2>Upload / Input Data</h2>

      <div className="input-group">
        <label>Passport Text</label>
        <textarea
          value={passport}
          onChange={(e) => setPassport(e.target.value)}
          placeholder="Paste passport OCR text..."
        />
      </div>

      <div className="input-group">
        <label>Ticket / Boarding Pass Text</label>
        <textarea
          value={ticket}
          onChange={(e) => setTicket(e.target.value)}
          placeholder="Paste boarding pass text..."
        />
      </div>

      <button className="big-btn" onClick={handleSubmit}>
        ⚡ Run AI Verification
      </button>
    </div>
  );
}

*/

import { useState } from "react";

const SCENARIOS = [
  {
    id: "o_mismatch",
    label: "O vs 0 Mismatch",
    desc: "Guinean passport — letter O typed as zero",
    color: "#ff8c00",
    type: "warn",
    passport: {
      surname: "DIALLO",
      given: "MAMADOU ALPHA",
      docNum: "01234567",
      expiry: "2029-11-12",
      nationality: "GIN",
      passportType: "ORDINARY",
    },
    ticket: {
      surname: "DIALLO",
      given: "MAMADOU ALPHA",
      docNum: "0I234567",
      flightDate: "2026-05-01",
      nationality: "GIN",
      flightNo: "AF 562",
    },
  },
  {
    id: "name_typo",
    label: "Name Typo",
    desc: "Surname differs by one character.",
    color: "#ff8c00",
    type: "warn",
    passport: {
      surname: "MARTIN",
      given: "JEAN PIERRE",
      docNum: "09876543",
      expiry: "2027-06-30",
      nationality: "FRA",
      passportType: "ORDINARY",
    },
    ticket: {
      surname: "MARTEN",
      given: "JEAN PIERRE",
      docNum: "09876543",
      flightDate: "2026-05-15",
      nationality: "FRA",
      flightNo: "LH 301",
    },
  },
  {
    id: "perfect_match",
    label: "Perfect Match",
    desc: "All fields match — clean boarding",
    color: "#00ff88",
    type: "success",
    passport: {
      surname: "SCHMIDT",
      given: "ANNA LISA",
      docNum: "DE5543210",
      expiry: "2030-03-14",
      nationality: "DEU",
      passportType: "ORDINARY",
    },
    ticket: {
      surname: "SCHMIDT",
      given: "ANNA LISA",
      docNum: "DE5543210",
      flightDate: "2026-06-01",
      nationality: "DEU",
      flightNo: "BA 456",
    },
  },
  {
    id: "expired",
    label: "Expired Document",
    desc: "Passport expired before travel date",
    color: "#ff2d55",
    type: "danger",
    passport: {
      surname: "NGUYEN",
      given: "THI HUONG",
      docNum: "VN2468013",
      expiry: "2024-01-01",
      nationality: "VNM",
      passportType: "ORDINARY",
    },
    ticket: {
      surname: "NGUYEN",
      given: "THI HUONG",
      docNum: "VN2468013",
      flightDate: "2026-05-10",
      nationality: "VNM",
      flightNo: "VN 202",
    },
  },
  {
    id: "critical",
    label: "Critical Mismatch",
    desc: "Name + doc number both wrong",
    color: "#ff2d55",
    type: "danger",
    passport: {
      surname: "OKAFOR",
      given: "CHIDI EMEKA",
      docNum: "NG1357924",
      expiry: "2028-09-20",
      nationality: "NGA",
      passportType: "ORDINARY",
    },
    ticket: {
      surname: "OKAFAR",
      given: "CHIDI AMEKA",
      docNum: "NG1357925",
      flightDate: "2026-05-25",
      nationality: "NGA",
      flightNo: "KL 589",
    },
  },
];

export default function UploadPage({
  setPage,
  setPassportData,
  setTicketData,
}) {
  const [activeScenario, setActiveScenario] = useState(0);

  const sc = SCENARIOS[activeScenario];

  const [passportFields, setPassportFields] = useState({ ...sc.passport });
  const [ticketFields, setTicketFields] = useState({ ...sc.ticket });

  const handleScenario = (idx) => {
    setActiveScenario(idx);
    setPassportFields({ ...SCENARIOS[idx].passport });
    setTicketFields({ ...SCENARIOS[idx].ticket });
  };

  const updatePassport = (k, v) =>
    setPassportFields((prev) => ({ ...prev, [k]: v }));
  const updateTicket = (k, v) =>
    setTicketFields((prev) => ({ ...prev, [k]: v }));

  // Detect mismatches for highlighting
  const mismatch = (a, b) =>
    a && b && a.trim().toUpperCase() !== b.trim().toUpperCase();

  const handleRun = () => {
    const passportText = `SURNAME:${passportFields.surname}|GIVEN:${passportFields.given}|DOC_NUM:${passportFields.docNum}|EXPIRY:${passportFields.expiry}|NATIONALITY:${passportFields.nationality}|TYPE:${passportFields.passportType}`;
    const ticketText = `SURNAME:${ticketFields.surname}|GIVEN:${ticketFields.given}|DOC_NUM:${ticketFields.docNum}|FLIGHT_DATE:${ticketFields.flightDate}|NATIONALITY:${ticketFields.nationality}|FLIGHT_NO:${ticketFields.flightNo}`;
    setPassportData(passportText);
    setTicketData(ticketText);
    setPage("verify");
  };

  const pillTypeClass = (sc) =>
    sc.type === "success"
      ? "success"
      : sc.type === "danger"
        ? "danger"
        : "warn";

  return (
    <div className="page">
      {/* Step label */}
      <div className="section-label" style={{ marginBottom: 10 }}>
        Step 1 — Select Demo Scenario
      </div>

      {/* Scenario pills */}
      <div className="scenario-row">
        {SCENARIOS.map((sc, idx) => (
          <div
            key={sc.id}
            className={`scenario-pill ${pillTypeClass(sc)} ${
              activeScenario === idx ? "active" : ""
            }`}
            onClick={() => handleScenario(idx)}
          >
            <div className="pill-header">
              <span className="pill-dot" style={{ background: sc.color }} />
              {sc.label}
            </div>
            <div className="pill-desc">{sc.desc}</div>
          </div>
        ))}
      </div>

      {/* Document panels */}
      <div className="doc-grid">
        <div className="doc-panel loaded">
          <div className="doc-panel-label">Passport / Identity Document</div>
          <div className="doc-icon">🛂</div>
          <div className="doc-title">Passport Loaded</div>
          <div className="doc-subtitle">Republic of Guinea · Ordinary Type</div>
          <div className="status-tag">✓ OCR Ready</div>
        </div>
        <div className="doc-panel loaded">
          <div className="doc-panel-label">Boarding Pass / PNR</div>
          <div className="doc-icon">✈️</div>
          <div className="doc-title">Boarding Pass Loaded</div>
          <div className="doc-subtitle">Air France AF 562 · CMN→CDG</div>
          <div className="status-tag">✓ PNR Parsed</div>
        </div>
      </div>

      {/* Extracted data */}
      <div className="data-section" style={{ marginBottom: 12 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: 2,
            color: "var(--text-label)",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Extracted Data Preview — Editable Fields
        </div>

        <div className="sources-grid">
          {/* Passport source */}
          <div>
            <div
              className="data-source-label source-a"
              style={{ marginBottom: 12 }}
            >
              Passport Data (Source A)
            </div>
            <div className="fields-grid-half">
              <div className="field-group">
                <label>Surname</label>
                <input
                  className="field-input"
                  value={passportFields.surname}
                  onChange={(e) => updatePassport("surname", e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Given Names</label>
                <input
                  className="field-input"
                  value={passportFields.given}
                  onChange={(e) => updatePassport("given", e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Doc Number</label>
                <input
                  className="field-input"
                  value={passportFields.docNum}
                  onChange={(e) => updatePassport("docNum", e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Expiry Date</label>
                <input
                  className="field-input"
                  value={passportFields.expiry}
                  onChange={(e) => updatePassport("expiry", e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Nationality</label>
                <input
                  className="field-input"
                  value={passportFields.nationality}
                  onChange={(e) =>
                    updatePassport("nationality", e.target.value)
                  }
                />
              </div>
              <div className="field-group">
                <label>Passport Type</label>
                <input
                  className="field-input"
                  value={passportFields.passportType}
                  onChange={(e) =>
                    updatePassport("passportType", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Ticket source */}
          <div>
            <div
              className="data-source-label source-b"
              style={{ marginBottom: 12 }}
            >
              Boarding Pass Data (Source B)
            </div>
            <div className="fields-grid-half">
              <div className="field-group">
                <label>Surname</label>
                <input
                  className={`field-input ${
                    mismatch(passportFields.surname, ticketFields.surname)
                      ? "mismatch"
                      : ""
                  }`}
                  value={ticketFields.surname}
                  onChange={(e) => updateTicket("surname", e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Given Names</label>
                <input
                  className={`field-input ${
                    mismatch(passportFields.given, ticketFields.given)
                      ? "mismatch"
                      : ""
                  }`}
                  value={ticketFields.given}
                  onChange={(e) => updateTicket("given", e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Doc Number (Typed)</label>
                <input
                  className={`field-input ${
                    mismatch(passportFields.docNum, ticketFields.docNum)
                      ? "mismatch"
                      : ""
                  }`}
                  value={ticketFields.docNum}
                  onChange={(e) => updateTicket("docNum", e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Flight Date</label>
                <input
                  className="field-input"
                  value={ticketFields.flightDate}
                  onChange={(e) => updateTicket("flightDate", e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Nationality</label>
                <input
                  className={`field-input ${
                    mismatch(
                      passportFields.nationality,
                      ticketFields.nationality,
                    )
                      ? "mismatch"
                      : ""
                  }`}
                  value={ticketFields.nationality}
                  onChange={(e) => updateTicket("nationality", e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Flight No.</label>
                <input
                  className="field-input"
                  value={ticketFields.flightNo}
                  onChange={(e) => updateTicket("flightNo", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Run button */}
      <div className="run-bar">
        <button className="run-btn" onClick={handleRun}>
          ⚡ Run AI Verification
        </button>
        <div className="backend-badge">
          <em>watsonx.ai</em> · IBM Backend Ready
        </div>
      </div>
    </div>
  );
}
