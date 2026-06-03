import { Card, Tag, Typography, Space, Button, message } from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const API_BASE = "http://localhost:8000";

export default function CourseCard({
  course,
  enrollmentMeta,
  completionMeta,
  progressMeta,
}) {
  const navigate = useNavigate();

  if (!course) return null;

  const {
    id,
    title,
    thumbnail_url,
    thumbnail,
    category,
    duration,
    level,
    description,
    course_title,
    course_category,
    course_duration,
    course_level,
    course_description,
    enrollment_count,
  } = course;

  const displayTitle = title || course_title || "Untitled";

  const resolvedCategory = category || course_category;
  const resolvedDuration = duration ?? course_duration;
  const resolvedLevel = level || course_level;
  const resolvedDescription = description || course_description;

  const imageUrl =
    thumbnail_url ||
    (thumbnail ? `${API_BASE}${thumbnail}` : null);

  const isCompleted =
    completionMeta?.completed_date ||
    enrollmentMeta?.status === "completed";

  const isEnrolled =
    enrollmentMeta &&
    enrollmentMeta?.status !== "completed";

  const handleEnroll = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/courses/${id}/enroll/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "lms_token"
            )}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        message.error("Enrollment failed");
        return;
      }

      message.success("Successfully enrolled!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      message.error("Enrollment failed");
    }
  };

  const handleContinueLearning = () => {
    navigate(`/course/${id}/learn`);
  };

  const handleDownloadCertificate = () => {
    navigate(`/certificate/${id}`);
  };

  return (
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
          />
        ) : (
          <div
            style={{
              height: 90,
              background: "#f3f4f6",
            }}
          />
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
             {course.enrollment_count ?? 0} Students Enrolled
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

        {enrollmentMeta?.status && !isCompleted && (
          <Tag
            color="success"
            style={{ 
              margin: 0, 
              fontSize: 9, 
              padding: "0 5px", 
              lineHeight: "18px", 
              borderRadius: 4, 
              width: "fit-content",
              backgroundColor: "#389e0d",
              color: "#ffffff",
              border: "none",
              fontWeight: 500,
            }}
          >
            ✓ {enrollmentMeta.status}
          </Tag>
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

        {/* Action Buttons */}
        <div style={{ marginTop: 6 }}>
          {isCompleted ? (
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
              }}
              onClick={handleDownloadCertificate}
            >
              Certificate
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
            >
              Enroll
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}