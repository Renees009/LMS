import { useState, useEffect } from "react";
import { Card, Tag, Typography, Space, Button, message } from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import CertificateGenerator from "../course/CertificateGenerator";

const { Text } = Typography;

const API_BASE = "http://localhost:8000";

export default function CourseCard({
  course,
  enrollmentMeta,
  completionMeta,
  progressMeta,
  isCompleted = false,
}) {
  const navigate = useNavigate();
  const [showCertificate, setShowCertificate] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
 
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);
          return;
        }

        const token = localStorage.getItem("lms_token");
        if (token) {
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const tokenData = JSON.parse(jsonPayload);
            
            const userInfo = {
              full_name: tokenData.full_name || tokenData.name || tokenData.username,
              username: tokenData.username,
              student_name: tokenData.student_name || tokenData.full_name || tokenData.username,
              email: tokenData.email
            };
            setUserData(userInfo);
            localStorage.setItem("user", JSON.stringify(userInfo));
            return;
          } catch (e) {
            console.error("Error decoding token:", e);
          }
        }

        const response = await fetch(`${API_BASE}/api/student/me/profile/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("lms_token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const userInfo = {
            full_name: data.student_name || data.username,
            username: data.username,
            student_name: data.student_name,
            email: data.email
          };
          setUserData(userInfo);
          localStorage.setItem("user", JSON.stringify(userInfo));
        } else {

          setUserData({
            full_name: "Student",
            username: "student",
            student_name: "Student"
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData({
          full_name: "Student",
          username: "student",
          student_name: "Student"
        });
      }
    };

    fetchUserData();
  }, []);

  if (!course) return null;

  const {
    id,
    title,
    thumbnail_url,
    thumbnail,
    category,
    duration,
    level,
    course_title,
    course_category,
    course_duration,
    course_level,
    enrollment_count,
  } = course;

  const displayTitle = title || course_title || "Untitled";
  const resolvedCategory = category || course_category;
  const resolvedDuration = duration ?? course_duration;
  const resolvedLevel = level || course_level;

  const imageUrl =
    thumbnail_url ||
    (thumbnail ? `${API_BASE}${thumbnail}` : null);

  const isCourseCompleted =
    completionMeta?.completed_date ||
    enrollmentMeta?.status === "completed" ||
    isCompleted;

  const isEnrolled =
    enrollmentMeta &&
    enrollmentMeta?.status !== "completed";

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/courses/${id}/enroll/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("lms_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        message.error(errorData.message || "Enrollment failed");
        return;
      }

      message.success("Successfully enrolled!");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error(error);
      message.error("Enrollment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueLearning = () => {
    navigate(`/course/${id}/learn`);
  };

  const handleDownloadCertificate = () => {
    if (!userData) {
      message.loading("Loading user data...", 1);
      return;
    }
    setShowCertificate(true);
  };

  return (
    <>
      <Card
        hoverable
        style={{
          width: "100%",
          height: "auto",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
        }}
        styles={{
          body: {
            padding: "8px",
          }
        }}
        cover={
          imageUrl ? (
            <img
              alt={displayTitle}
              src={imageUrl}
              style={{
                height: 90,
                objectFit: "cover",
                width: "100%",
              }}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x220?text=Course";
              }}
            />
          ) : (
            <div
              style={{
                height: 90,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 12,
              }}
            >
              No Image
            </div>
          )
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Text
            strong
            style={{
              fontSize: 12,
              color: "#1a1a1a",
              lineHeight: 1.3,
              height: 31,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {displayTitle}
          </Text>

          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <UserOutlined style={{ color: "#0369a1", fontSize: 10 }} />
            <Text style={{ color: "#0369a1", fontSize: 10, fontWeight: 500 }}>
              {enrollment_count ?? 0} Enrolled
            </Text>
          </div>

          <Space wrap size={4}>
            {resolvedCategory && (
              <Tag color="blue" style={{ margin: 0, fontSize: 9, padding: "0 5px", lineHeight: "18px", borderRadius: 4 }}>
                {resolvedCategory}
              </Tag>
            )}

            {resolvedLevel && (
              <Tag color="purple" style={{ margin: 0, fontSize: 9, padding: "0 5px", lineHeight: "18px", borderRadius: 4 }}>
                {resolvedLevel}
              </Tag>
            )}

            {resolvedDuration !== undefined && resolvedDuration !== null && (
              <Tag color="green" style={{ margin: 0, fontSize: 9, padding: "0 5px", lineHeight: "18px", borderRadius: 4 }}>
                <ClockCircleOutlined style={{ fontSize: 8, marginRight: 2 }} />
                {resolvedDuration} Hours
              </Tag>
            )}
          </Space>

          {progressMeta?.progress_percentage !== undefined && isEnrolled && (
            <div style={{ marginTop: 2 }}>
              <Text style={{ fontSize: 9, color: "#666" }}>
                Progress: {progressMeta.progress_percentage}%
              </Text>
              <div style={{
                height: 2,
                background: "#e5e7eb",
                borderRadius: 2,
                marginTop: 2,
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${progressMeta.progress_percentage}%`,
                  height: "100%",
                  background: "#1890ff",
                  borderRadius: 2
                }} />
              </div>
            </div>
          )}

          <div style={{ marginTop: 6 }}>
            {isCourseCompleted ? (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                block
                size="small"
                style={{
                  height: 26,
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 500,
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                }}
                onClick={handleDownloadCertificate}
              >
                Download Certificate
              </Button>
            ) : isEnrolled ? (
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Button
                  block
                  icon={<CheckCircleOutlined />}
                  disabled
                  size="small"
                  style={{
                    height: 26,
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 600,
                    backgroundColor: "#389e0d",
                    color: "#ffffff",
                    border: "none",
                    cursor: "default",
                  }}
                >
                  ✓ Enrolled
                </Button>
                <Button
                  type="primary"
                  icon={<BookOutlined />}
                  block
                  size="small"
                  style={{
                    height: 26,
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 500,
                  }}
                  onClick={handleContinueLearning}
                  loading={loading}
                >
                  Continue
                </Button>
              </Space>
            ) : (
              <Button
                type="primary"
                icon={<BookOutlined />}
                block
                size="small"
                style={{
                  height: 26,
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 500,
                }}
                onClick={handleEnroll}
                loading={loading}
              >
                Enroll
              </Button>
            )}
          </div>
        </div>
      </Card>

  
      {showCertificate && userData && (
        <CertificateGenerator
          visible={showCertificate}
          onClose={() => setShowCertificate(false)}
          course={course}
          user={userData}
          progressPercentage={progressMeta?.progress_percentage || 100}
        />
      )}
    </>
  );
}