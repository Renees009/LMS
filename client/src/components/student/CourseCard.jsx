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

  const hasNestedCourse = course && typeof course === "object" && course.course && typeof course.course === "object";
  const courseData = hasNestedCourse ? course.course : course;

  const getCourseId = () => {
    if (courseData && typeof courseData === "object" && courseData.id) {
      return courseData.id;
    }

    if (hasNestedCourse && course.course.id) {
      return course.course.id;
    }

    if (course && typeof course === "object" && course.course_id) {
      return course.course_id;
    }

    if (enrollmentMeta && enrollmentMeta.course_id) {
      return enrollmentMeta.course_id;
    }

    if (completionMeta && completionMeta.course_id) {
      return completionMeta.course_id;
    }

    console.error("[CourseCard] Could not find course ID in:", { course, enrollmentMeta, completionMeta });
    return null;
  };

  const actualCourseId = getCourseId();

  const getCourseDetail = (field) => {
    if (courseData && typeof courseData === "object" && courseData[field] !== undefined && courseData[field] !== null) {
      return courseData[field];
    }
    if (hasNestedCourse && course.course[field] !== undefined && course.course[field] !== null) {
      return course.course[field];
    }
    return null;
  };

  const displayTitle = getCourseDetail("title") || getCourseDetail("course_title") || "Untitled";
  const courseDescription =
    getCourseDetail("description") ||
    getCourseDetail("course_description") ||
    getCourseDetail("summary");
  const resolvedCategory = getCourseDetail("category") || getCourseDetail("course_category");
  const resolvedDuration = getCourseDetail("duration") || getCourseDetail("course_duration");
  const resolvedLevel = getCourseDetail("level") || getCourseDetail("course_level");
  
  const getThumbnailUrl = () => {
    const thumbUrl = getCourseDetail("thumbnail_url") || getCourseDetail("thumbnail");
    if (thumbUrl) {
      return thumbUrl.startsWith("http") ? thumbUrl : `${API_BASE}${thumbUrl}`;
    }
    return null;
  };
  
  const imageUrl = getThumbnailUrl();

  const normalizedStatus = (enrollmentMeta?.status || "").toString().trim().toLowerCase();
  const isCourseCompleted =
    Boolean(completionMeta?.completed_date) ||
    normalizedStatus === "completed" ||
    isCompleted;

  const isEnrolled =
    enrollmentMeta &&
    normalizedStatus !== "completed";

const handleEnroll = async () => {
  if (!actualCourseId) {
    message.error("Course not found");
    return;
  }
  navigate(`/student/course/${actualCourseId}`);
};

const handleContinueLearning = () => {
  if (!actualCourseId) {
    message.error("Course not found. Please try again.");
    return;
  }

  navigate(`/student/course/${actualCourseId}`);  
};

  const handleDownloadCertificate = () => {
    if (!userData) {
      message.loading("Loading user data...", 1);
      return;
    }
    setShowCertificate(true);
  };

  const getEnrollmentCount = () => {
    if (course.enrollment_count !== undefined && course.enrollment_count !== null) {
      return course.enrollment_count;
    }
    if (course.course?.enrollment_count !== undefined && course.course?.enrollment_count !== null) {
      return course.course.enrollment_count;
    }
    return 0;
  };

  const enrollmentCount = getEnrollmentCount();

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
              {enrollmentCount} Enrolled
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

          {enrollmentMeta?.enrolled_at && (
            <Text style={{ fontSize: 9, color: "#888", display: "block", marginTop: 4 }}>
              Enrolled on: {new Date(enrollmentMeta.enrolled_at).toLocaleDateString()}
            </Text>
          )}

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
          // Ensure that if progress is 0, it's passed as 0, not 100 (which happens with `||` operator)
          progressPercentage={progressMeta?.progress_percentage ?? 100} 
          quizScore={
            enrollmentMeta?.highest_quiz_score ?? 
            course?.highest_quiz_score ?? 
            enrollmentMeta?.highest_score ??
            enrollmentMeta?.recent_quiz_score ?? 
            completionMeta?.recent_quiz_score ?? 
            course?.recent_quiz_score
          }
          quizGrade={
            enrollmentMeta?.recent_quiz_grade ?? 
            completionMeta?.recent_quiz_grade ?? 
            enrollmentMeta?.highest_quiz_grade ?? 
            course?.recent_quiz_grade ?? 
            course?.highest_quiz_grade
          }
        />
      )}
    </>
  );
}