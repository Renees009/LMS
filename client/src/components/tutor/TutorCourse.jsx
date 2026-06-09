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
  Avatar,
  Tooltip,
} from "antd";
import { BookOutlined, UserOutlined, ClockCircleOutlined, PictureOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const API_BASE = "http://localhost:8000";

export default function TutorCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

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

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tutor/me/profile/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("lms_token")}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const img = data.profile_image_url || data.profile_image;
          setProfileImage(img && !img.startsWith("http") ? `${API_BASE}${img}` : img);
        }
      } catch (e) {
        console.error("Error fetching tutor profile:", e);
      }
    };
    fetchProfile();
  }, []);

  const handleManageCourse = (course) => {
    const id = course.id || course.course_id || course.pk;
    if (!id) {
      message.error("Course ID not found. Please check backend data.");
      return;
    }
    navigate(`/tutor/manage-lessons/${id}`);
  };

  const getThumbnailUrl = (course) => {
    if (course.thumbnail_url) {
      return course.thumbnail_url.startsWith("http")
        ? course.thumbnail_url
        : `${API_BASE}${course.thumbnail_url}`;
    }
    if (course.thumbnail) {
      return course.thumbnail.startsWith("http")
        ? course.thumbnail
        : `${API_BASE}${course.thumbnail}`;
    }
    return null;
  };

  const CourseThumbnail = ({ course }) => {
    const thumbnailUrl = getThumbnailUrl(course);
    const [imageError, setImageError] = useState(false);

    if (!thumbnailUrl || imageError) {
      return (
        <div
          style={{
            height: 100,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            gap: 8,
          }}
        >
          <PictureOutlined style={{ fontSize: 32, opacity: 0.7 }} />
          <Text style={{ color: "white", fontSize: 12, opacity: 0.8 }}>
            No Image Available
          </Text>
        </div>
      );
    }

    return (
      <img
        src={thumbnailUrl}
        alt={course.title}
        style={{
          height: 100,
          objectFit: "cover",
          width: "100%",
        }}
        onError={() => setImageError(true)}
      />
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "32px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
          maxWidth: 1400,
          margin: "0 auto 24px auto",
        }}
      >
       <Title
          level={2}
          style={{
            margin: 0,
          
            fontWeight: 700,
            letterSpacing: "-0.5px",
          }}
        >
          My Courses
        </Title>

        <Tooltip title="View Profile">
          <Avatar
            size={42}
            src={profileImage}
            icon={!profileImage && <UserOutlined />}
            onClick={() => navigate("/tutor/profile")}
            style={{ cursor: "pointer", border: "2px solid #1890ff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
          />
        </Tooltip>
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
          {courses.map((course, index) => {
            const courseKey = course.id || course.course_id || course.pk || `course-${index}`;
            return (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={courseKey}>
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
                cover={<CourseThumbnail course={course} />}
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
                  onClick={() => handleManageCourse(course)}
                >
                  Manage
                </Button>
              </Card>
            </Col>
            );
          })}

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