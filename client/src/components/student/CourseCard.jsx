import { Card, Tag, Typography, Space, Button, message } from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
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
        height: "100%",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
      }}
      bodyStyle={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
      cover={
        imageUrl ? (
          <img
            alt={displayTitle}
            src={imageUrl}
            style={{
              height: 200,
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              height: 200,
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
          height: "100%",
          minHeight: 260,
        }}
      >
        <Space
          direction="vertical"
          size={10}
          style={{
            width: "100%",
            flex: 1,
          }}
        >
          <Text
            strong
            style={{
              fontSize: 18,
              color: "#111827",
            }}
          >
            {displayTitle}
          </Text>
          <Text strong style={{ color: "#0369a1" }}>
                Students Enrolled : {course.enrollment_count}
              </Text>
          <Space wrap>
            {resolvedCategory && (
              <Tag color="blue">{resolvedCategory}</Tag>
            )}

            {resolvedLevel && (
              <Tag color="purple">{resolvedLevel}</Tag>
            )}

            {resolvedDuration !== undefined &&
              resolvedDuration !== null && (
                <Tag color="green">
                  {resolvedDuration} mins
                </Tag>
              )}
          </Space>

          {enrollmentMeta?.status && (
            <Tag
              color={
                enrollmentMeta.status === "completed"
                  ? "green"
                  : "blue"
              }
            >
              {enrollmentMeta.status}
            </Tag>
          )}

          {completionMeta?.completed_date && (
            <Text type="secondary">
              Completed on: {completionMeta.completed_date}
            </Text>
          )}

          {enrollmentMeta?.enrolled_at && (
            <Text type="secondary">
              Enrolled on: {enrollmentMeta.enrolled_at}
            </Text>
          )}

          {completionMeta?.tutor_details && (
            <Text type="secondary">
              Tutor: {completionMeta.tutor_details}
            </Text>
          )}

          {progressMeta?.progress_percentage !== undefined && (
            <Text>
              Progress: {progressMeta.progress_percentage}% (
              {progressMeta.completed_lessons}/
              {progressMeta.total_lessons})
            </Text>
          )}

          {resolvedDescription && (
            <Text
              type="secondary"
              style={{
                display: "block",
              }}
            >
              {resolvedDescription}
            </Text>
          )}
        </Space>

        
        <div
          style={{
            marginTop: "auto",
            paddingTop: 16,
          }}
        >
          {isCompleted ? (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              block
              size="large"
              style={{
                height: 45,
                borderRadius: 8,
              }}
              onClick={handleDownloadCertificate}
            >
              Download Certificate
            </Button>
          ) : isEnrolled ? (
            <Space
              direction="vertical"
              style={{
                width: "100%",
              }}
            >
              <Button
                block
                icon={<CheckCircleOutlined />}
                disabled
                size="large"
                style={{
                  height: 45,
                  borderRadius: 8,
                }}
              >
                Enrolled
              </Button>

              <Button
                type="primary"
                icon={<BookOutlined />}
                block
                size="large"
                style={{
                  height: 45,
                  borderRadius: 8,
                }}
                onClick={handleContinueLearning}
              >
                Continue Learning
              </Button>
            </Space>
          ) : (
            <Button
              type="primary"
              icon={<BookOutlined />}
              block
              size="large"
              style={{
                height: 45,
                borderRadius: 8,
              }}
              onClick={handleEnroll}
            >
              Enroll Now
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}