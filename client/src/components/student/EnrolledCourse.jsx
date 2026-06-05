import { useEffect, useState } from "react";
import { Card, Col, Row, Spin, Typography, message, Button } from "antd";
import { BookOutlined } from "@ant-design/icons";
import CourseCard from "./CourseCard";
import { getToken } from "../../auth/auth";

const { Title, Text } = Typography;
const API_BASE = "http://localhost:8000";

export default function EnrolledCourse() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        message.error("Please sign in to view enrolled courses.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/me/enrollments/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        let errorMessage = "Failed to load enrolled courses.";
        if (data) {
          errorMessage = data.detail || data.error || JSON.stringify(data);
        } else {
          errorMessage = `${res.status} ${res.statusText}`;
        }
        console.error("Enrolled courses load failed:", res.status, errorMessage);
        message.error(errorMessage);
        return;
      }
      const list = Array.isArray(data) ? data : data?.results || data?.enrollments || [];
      console.log("/api/me/enrollments response:", data);
      // Normalize enrollments so that each item has a `course` object
      const normalized = list.map((item) => {
        if (item && item.course) return item;
        // If API returned a course directly, wrap into an enrollment-like object
        if (item && item.id && item.title) {
          return { id: item.id, course: item };
        }
        return item;
      });
      const activeEnrollments = normalized.filter((item) => {
        const status = item?.status || item?.course?.status;
        return !["completed", "complete", "completed ", "Completed"].includes(
          status?.toString().trim().toLowerCase()
        );
      });
      setEnrollments(activeEnrollments);
    } catch (e) {
      console.error("Error loading enrolled courses:", e);
      message.error("Failed to load enrolled courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#f8fafc",
        minHeight: "100vh",
        padding: "24px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Title
            level={3}
            style={{
              margin: 0,
              color: "#111827",
              fontWeight: 600,
            }}
          >
            Enrolled Courses
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
          <>
            <Row gutter={[16, 16]}>
              {enrollments.map((enrollment) => (
                <Col xs={24} sm={12} md={12} lg={8} xl={6} key={enrollment.id || `${enrollment.course?.id}-${enrollment.enrolled_at}` }>
                  <CourseCard
                    course={enrollment.course || enrollment}
                    enrollmentMeta={{
                      status: enrollment.status,
                      enrolled_at: enrollment.enrolled_at,
                      course_id: enrollment.course?.id || enrollment.course,
                      highest_quiz_score: enrollment.highest_quiz_score,
                      highest_quiz_grade: enrollment.highest_quiz_grade,
                    }}
                    progressMeta={{
                      progress_percentage: enrollment.progress ?? 0,
                    }}
                  />
                </Col>
              ))}

              {enrollments.length === 0 && (
                <Col span={24}>
                  <Card
                    style={{
                      textAlign: "center",
                      borderRadius: 12,
                    }}
                    styles={{ body: { padding: 60 } }}
                  >
                    <BookOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
                    <Title level={4} style={{ color: "#666", marginBottom: 8 }}>
                      No Enrolled Courses
                    </Title>
                    <Text style={{ color: "#999" }}>You haven't enrolled in any courses yet.</Text>
                    <div style={{ marginTop: 20 }}>
                      <Button type="primary" href="/student/explore">
                        Explore Courses
                      </Button>
                    </div>
                  </Card>
                </Col>
              )}
            </Row>
          </>
        )}
      </div>
    </div>
  );
}

