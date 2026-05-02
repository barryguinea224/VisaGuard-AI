/*
export default function Topbar({ page, setPage }) {
  return (
    <div className="topbar">
      <div className="logo">Visa<em>Guard</em> AI</div>

      <div className="topbar-center">
        <button
          className={`nav-btn ${page === "upload" ? "active" : ""}`}
          onClick={() => setPage("upload")}
        >
          Upload
        </button>

        <button
          className={`nav-btn ${page === "verify" ? "active" : ""}`}
          onClick={() => setPage("verify")}
        >
          Verify
        </button>

        <button
          className={`nav-btn ${page === "dashboard" ? "active" : ""}`}
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </button>
      </div>

      <div className="topbar-right">
        <div className="live-badge">● LIVE</div>
      </div>
    </div>
  );
}
*/

/*
export default function Topbar({ page, setPage }) {
  return (
    <div className="topbar">
      <div className="logo">Visa<em>Guard</em> AI</div>

      <div className="topbar-center">
        {["upload", "verify", "dashboard"].map((p) => (
          <button
            key={p}
            className={`nav-btn ${page === p ? "active" : ""}`}
            onClick={() => setPage(p)}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
  */

import { useState, useEffect } from "react";

export default function Topbar({ page, setPage }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toUTCString().slice(17, 25) + " UTC");
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="topbar">
      <div className="logo">
        Visa<em>Guard</em> AI
      </div>

      <div className="topbar-center">
        {["upload", "verify", "dashboard"].map((p) => (
          <button
            key={p}
            className={`nav-btn ${page === p ? "active" : ""}`}
            onClick={() => setPage(p)}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="topbar-right">
        <div className="live-badge">
          <span className="live-dot" />
          LIVE SYSTEM
        </div>
        <div className="clock">{time}</div>
      </div>
    </div>
  );
}
