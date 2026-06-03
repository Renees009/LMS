import { useEffect, useState } from "react";
import { Card, Col, Row, Spin, Typography, message, Button } from "antd";
import { BookOutlined, ReloadOutlined } from "@ant-design/icons";
import CourseCard from "./CourseCard";

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
      const res = await fetch(`${API_BASE}/api/me/enrollments/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("lms_token")}`,
        },
      });

      if (!res.ok) {
        message.error("Failed to load enrolled courses");
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.results || [];
      setEnrollments(list);
    } catch (e) {
      console.error(e);
      message.error("Failed to load enrolled courses");
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
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
          </div>
    
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
            {/* Results count */}
            <div
              style={{
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
            </div>
            <Row gutter={[16, 16]}>
              {enrollments.map((enrollment) => (
                <Col xs={24} sm={12} md={12} lg={8} xl={6} key={enrollment.id}>
                  <CourseCard
                    course={enrollment}
                    enrollmentMeta={{
                      status: enrollment.status,
                      enrolled_at: enrollment.enrolled_at,
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
                    <Text style={{ color: "#999" }}>
                      You haven't enrolled in any courses yet.
                    </Text>
                    <div style={{ marginTop: 20 }}>
                      <Button type="primary" href="/explore">
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