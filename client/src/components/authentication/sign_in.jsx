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

function makeFakeToken() {
  return `ui_token_${Math.random().toString(16).slice(2)}`;
}

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      setError(" Invalid username or password");
      return;
    }

    const accounts = loadAccounts();
    const account = accounts[username];

    if (!account || account.password !== password) {
      setError("Invalid username or password.");
      return;
    }

    setLoading(true);
    setAuth({ token: makeFakeToken(), role: account.role });
    setLoading(false);

    if (account.role === "student")
      window.location.href = "/student/explore";
    else
      window.location.href = "/tutor/courses";
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>FLOW LEARN HUB</h1>

        <h2 style={headingStyle}>Sign In</h2>

        <form onSubmit={onSubmit}>
          <div style={inputGroup}>
            <label style={labelStyle}>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              style={inputStyle}
              placeholder="Enter username"
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              style={inputStyle}
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            style={buttonStyle}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={signupText}>
          Don't have an account?{" "}
          <a href="/signup" style={linkStyle}>
            Sign up
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
  width: "420px",
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