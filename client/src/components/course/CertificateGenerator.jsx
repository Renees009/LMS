import { useRef, useState, useEffect } from "react";
import { Modal, Button, message } from "antd";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const CertificateGenerator = ({ visible, onClose, course, user, progressPercentage = 100, quizScore = null, quizGrade = null }) => {
  const certificateRef = useRef();
  const [generating, setGenerating] = useState(false);
  const [studentName, setStudentName] = useState("");


  const getStudentName = () => {
    if (user) {
      if (user.full_name && user.full_name !== "Student") return user.full_name;
      if (user.student_name && user.student_name !== "Student") return user.student_name;
      if (user.name && user.name !== "Student") return user.name;
      if (user.username && user.username !== "student") return user.username;
    }

    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.full_name && parsedUser.full_name !== "Student") return parsedUser.full_name;
        if (parsedUser.student_name && parsedUser.student_name !== "Student") return parsedUser.student_name;
        if (parsedUser.name && parsedUser.name !== "Student") return parsedUser.name;
        if (parsedUser.username && parsedUser.username !== "student") return parsedUser.username;
      }
    } catch (e) {
      console.error("Error reading user from localStorage:", e);
    }

    if (course) {
      if (course.student_name && course.student_name !== "Student") return course.student_name;
      if (course.username && course.username !== "student") return course.username;
    }

    return null;
  };

  const fetchStudentNameFromAPI = async () => {
    try {
      const token = localStorage.getItem("lms_token");
      if (!token) return null;
      
      const response = await fetch(`http://localhost:8000/api/student/me/profile/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.student_name || data.username || null;
      }
      return null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  useEffect(() => {
    if (visible) {
      const loadStudentName = async () => {
  
        let name = getStudentName();
 
        if (!name) {
          name = await fetchStudentNameFromAPI();
        }

        if (!name || name === "Student" || name === "student") {
          name = "Valued Student";
        }
        setStudentName(name);
      };
      loadStudentName();
    }
  }, [visible, user, course]);
  console.log("CertificateGenerator received quizScore:", quizScore, "quizGrade:", quizGrade, "progressPercentage:", progressPercentage);

  const generatePDF = async () => {
    if (!certificateRef.current) return;

    try {
      setGenerating(true);
      message.loading("Generating certificate...", 0);

      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${course.title.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf`);

      message.destroy();
      message.success("Certificate downloaded successfully!");
      onClose();
    } catch (error) {
      console.error("Error generating certificate:", error);
      message.destroy();
      message.error("Failed to generate certificate");
    } finally {
      setGenerating(false);
    }
  };

  const getFormattedDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCompletionDate = () => {
    if (course?.completed_date) {
      const date = new Date(course.completed_date);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return getFormattedDate();
  };

  const getCertificateId = () => {
    return `CERT-${course.id}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;
  };

  const getCourseLevel = () => {
    return course?.level || course?.course_level || "Professional";
  };

  return (
    <Modal
      title="Your Certificate of Completion"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="download"
          type="primary"
          onClick={generatePDF}
          loading={generating}
          style={{
            backgroundColor: "#52c41a",
            borderColor: "#52c41a",
          }}
        >
          Download Certificate
        </Button>,
      ]}
      width={900}
      styles={{ body: { padding: 0, overflow: "auto", maxHeight: "70vh" } }}
      centered
    >
      <div
        ref={certificateRef}
        style={{
          width: "800px",
          minHeight: "566px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          position: "relative",
          padding: "40px",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: 15,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "radial-gradient(circle, #ffd700, #ffed4e)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: "bold",
            color: "#8b6914",
            textAlign: "center",
            opacity: 0.9,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            zIndex: 1,
          }}
        >
          CERTIFIED
        </div>

        {[0, 1, 2, 3].map((corner) => (
          <div
            key={corner}
            style={{
              position: "absolute",
              [corner === 0 || corner === 1 ? "top" : "bottom"]: 30,
              [corner === 0 || corner === 3 ? "left" : "right"]: 30,
              width: 50,
              height: 50,
              borderTop: corner < 2 ? "3px solid rgba(255,255,255,0.5)" : "none",
              borderBottom: corner > 1 ? "3px solid rgba(255,255,255,0.5)" : "none",
              borderLeft: corner % 2 === 0 ? "3px solid rgba(255,255,255,0.5)" : "none",
              borderRight: corner % 2 === 1 ? "3px solid rgba(255,255,255,0.5)" : "none",
              zIndex: 1,
            }}
          />
        ))}

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            color: "#ffffff",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <p
              style={{
                fontSize: 22,
                letterSpacing: 4,
                fontWeight: "600",
                textTransform: "uppercase",
                wordWrap: "break-word",
                margin: 0,
                opacity: 0.85,
              }}
            >
              FLOW LEARN HUB
            </p>
          </div>

          <div style={{ marginBottom: 25 }}>
            <h1
              style={{
                fontSize: 32,
                marginBottom: 10,
                letterSpacing: 2,
                fontWeight: "500",
                textTransform: "uppercase",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                wordWrap: "break-word",
              }}
            >
              Certificate of Completion
            </h1>
            <div
              style={{
                width: 70,
                height: 2,
                background: "#ffffff",
                margin: "12px auto",
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 16, opacity: 0.95, margin: 0, wordWrap: "break-word" }}>
              This certificate is proudly presented to
            </p>
          </div>

          <div style={{ marginBottom: 25 }}>
            <h2
              style={{
                fontSize: 30,
                marginBottom: 10,
                fontFamily: "Times New Roman",
                fontWeight: "normal",
                textTransform: "uppercase",
                wordWrap: "break-word",
                maxWidth: "90%",
                margin: "0 auto",
              }}
            >
              {studentName}
            </h2>
            <div
              style={{
                width: 150,
                height: 1,
                background: "rgba(255,255,255,0.5)",
                margin: "10px auto",
              }}
            />
          </div>

          <div style={{ marginBottom: 30, maxWidth: "90%", margin: "0 auto 30px" }}>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.6,
                margin: 0,
                wordWrap: "break-word",
              }}
            >
              for successfully completing the{" "}
              <span style={{ color: "#ffd700", fontWeight: "bold" }}>
                {course?.title || "Professional Course"}
              </span>{" "}
              course for{" "}
              <span style={{ color: "#ffd700", fontWeight: "bold" }}>
                {getCourseLevel()}
              </span>{" "}
              
              on{" "}
              <span style={{ color: "#ffd700", fontWeight: "bold" }}>
                {getCompletionDate()}
              </span>
              
                
             
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
              paddingTop: 20,
              gap: 40,
              flexWrap: "wrap",
            }}
          >
            <div style={{ textAlign: "center", minWidth: 200 }}>
              <div
                style={{
                  width: "80%",
                  height: 1,
                  background: "#ffffff",
                  marginBottom: 8,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
              <p style={{ fontSize: 11, opacity: 0.8, margin: 0, textTransform: "uppercase" }}>
                Certificate ID
              </p>
              <p style={{ fontSize: 10, margin: "5px 0 0 0", fontFamily: "monospace", wordWrap: "break-word" }}>
                {getCertificateId()}
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: 30,
              fontSize: 9,
              opacity: 0.6,
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0 }}>
              This certificate is digitally verified and authentic
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CertificateGenerator;