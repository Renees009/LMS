import { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Spin,
  Typography,
  Tag,
  Button,
  message,
} from "antd";
import { BookOutlined, UserOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const API_BASE = "http://localhost:8000";

export default function TutorCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_BASE}/api/tutor/courses/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("lms_token")}`,
          },
        });

        if (!res.ok) {
          message.error("Failed to load courses");
          return;
        }

        const data = await res.json();

        const list = Array.isArray(data)
          ? data
          : data?.results || [];

        setCourses(list);
      } catch (err) {
        console.error(err);
        message.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleManageCourse = (courseId) => {
    navigate(`/tutor/course/${courseId}`);
  };

  return (
    <div
      style={{
        background: "#f0f2f6",
        minHeight: "100vh",
        padding: "32px 24px",
      }}
    >
      <div
        style={{
          marginBottom: 32,
          maxWidth: 1400,
          margin: "0 auto 32px auto",
        }}
      >
        <Title
          level={2}
          style={{
            marginBottom: 8,
            color: "#1a1a1a",
            fontWeight: 600,
          }}
        >
          My Courses
        </Title>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]} style={{ maxWidth: 1400, margin: "0 auto" }}>
          {courses.map((course) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={course.id}>
              <Card
                hoverable
                style={{
                  borderRadius: 10,
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  height: "auto",
                }}
                styles={{
                  body: {
                    padding: "10px",
                  },
                }}

                cover={
                  <img
                    src={
                      course.thumbnail_url
                        ? course.thumbnail_url.startsWith("http")
                          ? course.thumbnail_url
                          : `${API_BASE}${course.thumbnail_url}`
                        : course.thumbnail
                          ? course.thumbnail.startsWith("http")
                            ? course.thumbnail
                            : `${API_BASE}${course.thumbnail}`
                          : "https://via.placeholder.com/400x220?text=Course"
                    }
                    alt={course.title}
                    style={{ 
                      height: 100, 
                      objectFit: "cover",
                      width: "100%",
                    }}
                  />
                }
              >
                <Title
                  level={5}
                  style={{
                    color: "#1a1a1a",
                    marginBottom: 3,
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    height: 34,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {course.title}
                </Title>

                <div style={{ marginBottom: 5, display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <Tag color="blue" style={{ margin: 0, borderRadius: 4, fontSize: 9, padding: "0 5px", lineHeight: "18px" }}>
                    {course.category}
                  </Tag>
                  <Tag color="green" style={{ margin: 0, borderRadius: 4, fontSize: 9, padding: "0 5px", lineHeight: "18px" }}>
                    {course.level}
                  </Tag>
                </div>

                <div style={{ 
                  marginBottom: 6, 
                  display: "flex", 
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <ClockCircleOutlined style={{ color: "#d41a1a", fontSize: 10 }} />
                    <Text style={{ color: "#d41a1a", fontSize: 10 }}>
                      {course.duration} Hours
                    </Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <UserOutlined style={{ color: "#173720", fontSize: 10 }} />
                    <Text style={{ color: "#173720", fontSize: 10 }}>
                      {course.enrollment_count ?? 0} Students Enrolled
                    </Text>
                  </div>
                </div>

                <Button
                  type="primary"
                  icon={<BookOutlined />}
                  block
                  size="small"
                  style={{
                    height: 28,
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: 11,
                  }}
                  onClick={() => handleManageCourse(course.id)}
                >
                  Manage
                </Button>
              </Card>
            </Col>
          ))}

          {courses.length === 0 && (
            <Col span={24}>
              <Card
                style={{
                  borderRadius: 12,
                  textAlign: "center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
                styles={{ body: { padding: 48 } }}
              >
                <Title
                  level={4}
                  style={{
                    color: "#666",
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  No Courses Found
                </Title>
                <Text
                  style={{
                    color: "#999",
                    fontSize: 14,
                  }}
                >
                  Create your first course to get started.
                </Text>
              </Card>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
}