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
import { BookOutlined } from "@ant-design/icons";
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
        background: "#f5f7fb",
        minHeight: "100vh",
        padding: "30px",
      }}
    >
      
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Title
            level={2}
            style={{
              marginBottom: 0,
              color: "#111827",
            }}
          >
            My Courses
          </Title>

          
        </div>

        
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 60,
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[20, 20]}>
          {courses.map((course) => (
           <Col
            xs={24}
            sm={24}
            md={12}
            lg={12}
            key={course.id}
          >
            <Card
              hoverable
              style={{
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                width: "100%",
                minHeight: 520,
                display: "flex",
                flexDirection: "column",
              }}
                cover={
                  <img
                    src={
                      course.thumbnail
                        ? `${API_BASE}${course.thumbnail}`
                        : "https://via.placeholder.com/400x220?text=Course"
                    }
                    alt={course.title}
                    style={{
                      height: 200,
                      objectFit: "cover",
                    }}
                  />
                }
              >
                <Title
                  level={5}
                  style={{
                    color: "#111827",
                    marginBottom: 8,
                  }}
                >
                  {course.title}
                </Title>

                <div
                  style={{
                    marginBottom: 12,
                  }}
                >
                  <Tag color="purple">
                    {course.category}
                  </Tag>

                  <Tag color="green">
                    {course.level}
                  </Tag>
                </div>

                <Text
                  strong
                  style={{
                    color: "#1f2937",
                  }}
                >
                  Duration:
                </Text>

                <Text
                  style={{
                    color: "#374151",
                    marginLeft: 5,
                  }}
                >
                  {course.duration} Weeks
                </Text>

                <div
                  style={{
                    marginTop: 12,
                    minHeight: 70,
                  }}
                >
                  <Text
                    style={{
                      color: "#374151",
                    }}
                  >
                    {course.description}
                  </Text>
                </div>
                  <Text strong style={{ color: "#0369a1" }}>
                    Students Enrolled : {course.enrollment_count}
                  </Text>
                <Button
                  type="primary"
                  icon={<BookOutlined />}
                  block
                  style={{
                    marginTop: 18,
                    height: 40,
                    borderRadius: 8,
                  }}
                  onClick={() =>
                    handleManageCourse(course.id)
                  }
                >
                  Manage Course
                </Button>
              </Card>
            </Col>
          ))}

          {courses.length === 0 && (
            <Col span={24}>
              <Card
                style={{
                  borderRadius: 16,
                  textAlign: "center",
                  padding: 50,
                }}
              >
                <Title
                  level={4}
                  style={{
                    color: "#374151",
                  }}
                >
                  No Courses Found
                </Title>

                <Text
                  style={{
                    color: "#6b7280",
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