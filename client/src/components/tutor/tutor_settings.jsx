import { useState } from "react";

export default function TutorSettings() {
  const [darkTheme, setDarkTheme] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Password mis match!");
      return;
    }

    setMessage("Password changed successfully!");
  };

  return (
    <div
      style={{
        ...pageStyle,
        backgroundColor: darkTheme ? "#1e293b" : "#f8fafc",
      }}
    >
      <h2
        style={{
          ...headingStyle,
          color: darkTheme ? "white" : "#1e293b",
        }}
      >
        Tutor Settings
      </h2>

      <form style={formStyle} onSubmit={handleSubmit}>
        <div style={formRow}>
          <label
            style={{
              ...labelStyle,
              color: darkTheme ? "white" : "#1e293b",
            }}
          >
            Old Password
          </label>
          <input
            type="password"
            defaultValue="********"
            style={inputStyle}
            readOnly
          />
        </div>

        <div style={formRow}>
          <label
            style={{
              ...labelStyle,
              color: darkTheme ? "white" : "#1e293b",
            }}
          >
            New Password
          </label>
          <input
            type="text"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={formRow}>
          <label
            style={{
              ...labelStyle,
              color: darkTheme ? "white" : "#1e293b",
            }}
          >
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        {message && (
          <p
            style={{
              textAlign: "center",
              color:
                message === "Password changed successfully!"
                  ? "green"
                  : "red",
              fontWeight: "bold",
            }}
          >
            {message}
          </p>
        )}

        <div style={buttonContainer}>
          <button type="submit" style={buttonStyle}>
            Change Password
          </button>
        </div>

        {/* Theme Toggle */}
        <div style={{ ...formRow, marginTop: "50px" }}>
          <label
            style={{
              ...labelStyle,
              color: darkTheme ? "white" : "#1e293b",
            }}
          >
            Theme
          </label>

          <label style={toggleContainer}>
            <input
              type="checkbox"
              checked={darkTheme}
              onChange={() => setDarkTheme(!darkTheme)}
              style={{ display: "none" }}
            />

            <div
              style={{
                ...toggleSwitch,
                backgroundColor: darkTheme ? "#22c55e" : "#cbd5e1",
              }}
            >
              <div
                style={{
                  ...toggleCircle,
                  transform: darkTheme
                    ? "translateX(30px)"
                    : "translateX(0)",
                }}
              />
            </div>

            <span
              style={{
                marginLeft: "15px",
                color: darkTheme ? "white" : "#1e293b",
                fontWeight: "600",
              }}
            >
              {darkTheme ? "Dark Theme" : "Light Theme"}
            </span>
          </label>
        </div>
      </form>
    </div>
  );
}

const pageStyle = {
  width: "100%",
  minHeight: "100vh",
  padding: "30px 50px",
  boxSizing: "border-box",
  transition: "0.3s",
};

const headingStyle = {
  textAlign: "center",
  marginBottom: "40px",
};

const formStyle = {
  maxWidth: "900px",
  margin: "0 auto",
};

const formRow = {
  display: "flex",
  alignItems: "center",
  marginBottom: "25px",
};

const labelStyle = {
  width: "220px",
  fontWeight: "600",
  fontSize: "18px",
};

const inputStyle = {
  flex: 1,
  padding: "14px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  backgroundColor: "white",
  color: "#1e293b",
  fontSize: "16px",
  outline: "none",
};

const buttonContainer = {
  display: "flex",
  justifyContent: "center",
  marginTop: "35px",
};

const buttonStyle = {
  backgroundColor: "#1e293b",
  color: "white",
  border: "none",
  padding: "14px 30px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
};

const toggleContainer = {
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
};

const toggleSwitch = {
  width: "60px",
  height: "30px",
  borderRadius: "20px",
  padding: "3px",
  transition: "0.3s",
};

const toggleCircle = {
  width: "24px",
  height: "24px",
  backgroundColor: "white",
  borderRadius: "50%",
  transition: "0.3s",
};