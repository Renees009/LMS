import { useState } from "react";

export default function TutorProfile() {
  const [profileImage, setProfileImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  return (
    <div style={pageStyle}>
      <h2 style={headingStyle}>Tutor Profile</h2>

      {/* Profile Image */}
      <div style={imageContainer}>
        <img
          src={
            profileImage ||
            "https://via.placeholder.com/120?text=Profile"
          }
          alt="Profile"
          style={imageStyle}
        />

        <label style={uploadButton}>
          Change Photo
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
        </label>
      </div>

      <form style={formStyle}>
        <div style={formRow}>
          <label style={labelStyle}>Tutor Name</label>
          <input
            type="text"
            placeholder="Enter tutor name"
            style={inputStyle}
          />
        </div>

        <div style={formRow}>
          <label style={labelStyle}>Specialization</label>
          <input
            type="text"
            placeholder="Enter specialization"
            style={inputStyle}
          />
        </div>

        <div style={formRow}>
          <label style={labelStyle}>Contact Number</label>
          <input
            type="tel"
            placeholder="Enter contact number"
            style={inputStyle}
          />
        </div>

        <div style={formRow}>
          <label style={labelStyle}>Gmail</label>
          <input
            type="email"
            placeholder="Enter email"
            style={inputStyle}
          />
        </div>

        <div style={buttonContainer}>
          <button type="submit" style={buttonStyle}>
            Save
          </button>
          <button type="button" style={buttonStyle}>
            Update
          </button>
        </div>
      </form>
    </div>
  );
}

const pageStyle = {
  width: "100%",
  minHeight: "100vh",
  padding: "30px 50px",
  backgroundColor: "#f8fafc",
  boxSizing: "border-box",
};

const headingStyle = {
  textAlign: "center",
  color: "#1e293b",
  marginBottom: "30px",
};

const imageContainer = {
  textAlign: "center",
  marginBottom: "40px",
};

const imageStyle = {
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "3px solid #1e293b",
};

const uploadButton = {
  display: "block",
  width: "150px",
  margin: "15px auto",
  padding: "10px",
  backgroundColor: "#1e293b",
  color: "white",
  textAlign: "center",
  borderRadius: "8px",
  cursor: "pointer",
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
  color: "#1e293b",
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
  gap: "20px",
  marginTop: "40px",
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