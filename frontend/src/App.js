/*
import { useState } from "react";
import Topbar from "./components/Topbar";
import UploadPage from "./components/UploadPage";
import VerifyPage from "./components/VerifyPage";
import Dashboard from "./components/Dashboard";
//import "./styles.css";

export default function App() {
  const [page, setPage] = useState("upload");
  const [passportData, setPassportData] = useState("");
  const [ticketData, setTicketData] = useState("");
  const [result, setResult] = useState(null);

  return (
    <div className="app">
      <Topbar page={page} setPage={setPage} />

      {page === "upload" && (
        <UploadPage
          setPage={setPage}
          setPassportData={setPassportData}
          setTicketData={setTicketData}
        />
      )}

      {page === "verify" && (
        <VerifyPage
          passportData={passportData}
          ticketData={ticketData}
          result={result}
          setResult={setResult}
        />
      )}

      {page === "dashboard" && <Dashboard />}
    </div>
  );
}
  */

import { useState } from "react";
import Topbar from "./components/Topbar";
import UploadPage from "./components/UploadPage";
import VerifyPage from "./components/VerifyPage";
import Dashboard from "./components/Dashboard";
import "./styles.css";

export default function App() {
  const [page, setPage] = useState("upload");
  const [passportData, setPassportData] = useState("");
  const [ticketData, setTicketData] = useState("");
  const [result, setResult] = useState(null);

  // Reset result when new data comes in
  const handleSetPassportData = (data) => {
    setPassportData(data);
    setResult(null);
  };

  const handleSetTicketData = (data) => {
    setTicketData(data);
  };

  return (
    <div className="app">
      <Topbar page={page} setPage={setPage} />

      {page === "upload" && (
        <UploadPage
          setPage={setPage}
          setPassportData={handleSetPassportData}
          setTicketData={handleSetTicketData}
        />
      )}

      {page === "verify" && (
        <VerifyPage
          passportData={passportData}
          ticketData={ticketData}
          result={result}
          setResult={setResult}
        />
      )}

      {page === "dashboard" && <Dashboard />}
    </div>
  );
}
