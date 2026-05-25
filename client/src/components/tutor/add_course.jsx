import { useState } from "react";

export default function AddCourse() {
  const [thumbnail, setThumbnail] = useState(null);
  const [category, setCategory] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(URL.createObjectURL(file));
    }
  };

  return (
    <div style={pageStyle}>
      <h2 style={headingStyle}>Add New Course</h2>

      <form style={formStyle}>
        {/* Thumbnail */}
        <div style={imageContainer}>
          <img
            src={
              thumbnail ||
              "https://via.placeholder.com/180x120?text=Course+Image"
            }
            alt="Course"
            style={imageStyle}
          />

          <label style={uploadButton}>
            Upload Thumbnail
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
          </label>
        </div>

        <div style={formRow}>
          <label style={labelStyle}>Course Title</label>
          <input
            type="text"
            placeholder="Enter course title"
            style={inputStyle}
          />
        </div>

        <div style={formRow}>
          <label style={labelStyle}>Tutor Details</label>
          <input
            type="text"
            placeholder="Enter tutor details"
            style={inputStyle}
          />
        </div>

        <div style={formRow}>
          <label style={labelStyle}>Course Category</label>
          <select
            style={inputStyle}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Select Category</option>
            <option>Programming</option>
            <option>Web Development</option>
            <option>UI/UX Design</option>
            <option>Data Science</option>
            <option>Others</option>
          </select>
        </div>

        {category === "Others" && (
          <div style={formRow}>
            <label style={labelStyle}>New Category</label>
            <input
              type="text"
              placeholder="Enter course category"
              style={inputStyle}
            />
          </div>
        )}

        <div style={formRow}>
          <label style={labelStyle}>Course Duration</label>
          <input
            type="text"
            placeholder="e.g. 8 weeks"
            style={inputStyle}
          />
        </div>

        <div style={formRow}>
          <label style={labelStyle}>Course Level</label>
          <select style={inputStyle}>
            <option>Select Level</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>

        <div style={formRow}>
          <label style={labelStyle}>Description</label>
          <textarea
            rows="4"
            placeholder="Enter course description"
            style={textareaStyle}
          />
        </div>

        <div style={formRow}>
          <label style={labelStyle}>Upload Videos</label>
          <input
            type="file"
            accept="video/*"
            multiple
            style={inputStyle}
          />
        </div>

        <div style={formRow}>
          <label style={labelStyle}>Course Materials</label>
          <input
            type="file"
            accept=".pdf,.ppt,.pptx"
            multiple
            style={inputStyle}
          />
        </div>

        <div style={buttonContainer}>
          <button type="submit" style={buttonStyle}>
            Add Course
          </button>

          <button type="reset" style={resetButtonStyle}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

/* styles */

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
  marginBottom: "35px",
};

const formStyle = {
  maxWidth: "950px",
  margin: "0 auto",
};

const imageContainer = {
  textAlign: "center",
  marginBottom: "40px",
};

const imageStyle = {
  width: "180px",
  height: "120px",
  objectFit: "cover",
  borderRadius: "8px",
  border: "2px solid #1e293b",
};

const uploadButton = {
  display: "block",
  width: "170px",
  margin: "15px auto",
  padding: "10px",
  backgroundColor: "#1e293b",
  color: "white",
  textAlign: "center",
  borderRadius: "8px",
  cursor: "pointer",
};

const formRow = {
  display: "flex",
  alignItems: "center",
  marginBottom: "22px",
};

const labelStyle = {
  width: "220px",
  fontWeight: "600",
  color: "#1e293b",
  fontSize: "17px",
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

const textareaStyle = {
  flex: 1,
  padding: "14px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  backgroundColor: "white",
  color: "#1e293b",
  fontSize: "16px",
  resize: "none",
  outline: "none",
};

const buttonContainer = {
  display: "flex",
  justifyContent: "center",
  gap: "20px",
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

const resetButtonStyle = {
  backgroundColor: "#64748b",
  color: "white",
  border: "none",
  padding: "14px 30px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
};