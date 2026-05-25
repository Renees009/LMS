import { useState } from "react";
import { setAuth } from "../../auth/auth";

const ACCOUNTS_KEY = "lms_accounts_v1";

function loadAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAccounts(next) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
}

function makeFakeToken() {
  return `ui_token_${Math.random().toString(16).slice(2)}`;
}

export default function SignUp() {
  const [accountType, setAccountType] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");

  const [tutorName, setTutorName] = useState("");
  const [specialization, setSpecialization] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    if (username !== password) {
      setError("Username must be same as password.");
      return;
    }

    if (accountType === "student" && !fullName) {
      setError("Student full name is required.");
      return;
    }

    if (accountType === "tutor" && !tutorName) {
      setError("Tutor name is required.");
      return;
    }

    const accounts = loadAccounts();

    if (accounts[username]) {
      setError("Account already exists.");
      return;
    }

    const profile = {
      fullName,
      studentId,
      tutorName,
      specialization,
    };

    accounts[username] = {
      username,
      password,
      role: accountType,
      ...profile,
      createdAt: Date.now(),
    };

    setLoading(true);
    saveAccounts(accounts);
    setAuth({ token: makeFakeToken(), role: accountType });
    setLoading(false);

    if (accountType === "student")
      window.location.href = "/student/explore";
    else
      window.location.href = "/tutor/courses";
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>FLOW LEARN HUB</h1>

        <h2 style={headingStyle}>Sign Up</h2>

        <form onSubmit={onSubmit}>
          <div style={inputGroup}>
            <label style={labelStyle}>Account Type</label>

            <div style={radioContainer}>
              <label>
                <input
                  type="radio"
                  checked={accountType === "student"}
                  onChange={() => setAccountType("student")}
                />{" "}
                Student
              </label>

              <label>
                <input
                  type="radio"
                  checked={accountType === "tutor"}
                  onChange={() => setAccountType("tutor")}
                />{" "}
                Tutor
              </label>
            </div>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="Enter username"
              style={inputStyle}
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter password"
              style={inputStyle}
            />
          </div>

          {accountType === "student" ? (
            <>
              <div style={inputGroup}>
                <label style={labelStyle}>Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  type="text"
                  placeholder="Enter full name"
                  style={inputStyle}
                />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Student ID</label>
                <input
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  type="text"
                  placeholder="Optional"
                  style={inputStyle}
                />
              </div>
            </>
          ) : (
            <>
              <div style={inputGroup}>
                <label style={labelStyle}>Tutor Name</label>
                <input
                  value={tutorName}
                  onChange={(e) => setTutorName(e.target.value)}
                  type="text"
                  placeholder="Enter tutor name"
                  style={inputStyle}
                />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Specialization</label>
                <input
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  type="text"
                  placeholder="Optional"
                  style={inputStyle}
                />
              </div>
            </>
          )}

          {error && <div style={errorStyle}>{error}</div>}

          <button disabled={loading} type="submit" style={buttonStyle}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={signupText}>
          Already have an account?{" "}
          <a href="/signin" style={linkStyle}>
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#f8fafc",
};

const cardStyle = {
  width: "480px",
  backgroundColor: "white",
  padding: "40px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const titleStyle = {
  textAlign: "center",
  color: "#1e293b",
  marginBottom: "10px",
  fontSize: "32px",
  fontWeight: "bold",
};

const headingStyle = {
  textAlign: "center",
  color: "#334155",
  marginBottom: "30px",
};

const inputGroup = {
  marginBottom: "20px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  color: "#1e293b",
};

const radioContainer = {
  display: "flex",
  gap: "30px",
  marginTop: "10px",
  color: "#1e293b",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "16px",
  boxSizing: "border-box",
};

const errorStyle = {
  color: "crimson",
  textAlign: "center",
  marginBottom: "15px",
  fontWeight: "500",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  backgroundColor: "#1e293b",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
};

const signupText = {
  textAlign: "center",
  marginTop: "20px",
  color: "#1e293b",
};

const linkStyle = {
  color: "#2563eb",
  textDecoration: "none",
  fontWeight: "600",
};