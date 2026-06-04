import { useEffect, useState } from "react";
import { Card, Col, Row, Spin, Typography, message, Button } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import CourseCard from "./CourseCard";

const { Title, Text } = Typography;
const API_BASE = "http://127.0.0.1:8000";

export default function CompletedCourse() {
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCompletedCourses();
  }, []);

  const loadCompletedCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/me/completions/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("lms_token")}`,
        },
      });

      if (!res.ok) {
        const bodyText = await res.text().catch(() => "");
        message.error(
          `Failed to load completed courses (HTTP ${res.status})` +
            (bodyText ? `: ${bodyText}` : "")
        );
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.results || [];
      setCompletions(list);
    } catch (e) {
      console.error(e);
      message.error("Failed to load completed courses");
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
              <TrophyOutlined style={{ fontSize: 28, color: "#faad14" }} />
              <Title
                level={3}
                style={{
                  margin: 0,
                  color: "#111827",
                  fontWeight: 600,
                }}
              >
                Completed Courses
              </Title>
            </div>
            <Text style={{ color: "#666", fontSize: 14 }}>
              Celebrate your achievements and download certificates
            </Text>
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
              {completions.map((completion) => (
                <Col xs={24} sm={12} md={12} lg={8} xl={6} key={completion.id}>
                  <CourseCard
                    course={completion}
                    completionMeta={{
                      completed_date: completion.completed_date,
                      tutor_details: completion.tutor_details,
                    }}
                    isCompleted={true}
                  />
                </Col>
              ))}

              {completions.length === 0 && (
                <Col span={24}>
                  <Card
                    style={{
                      textAlign: "center",
                      borderRadius: 12,
                    }}
                    styles={{ body: { padding: 60 } }}
                  >
                    <TrophyOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
                    <Title level={4} style={{ color: "#666", marginBottom: 8 }}>
                      No Completed Courses Yet
                    </Title>
                    <Text style={{ color: "#999" }}>
                      Complete your enrolled courses to see them here
                    </Text>
                    <div style={{ marginTop: 20 }}>
                      <Button type="primary" href="/student/enrolled">
                        View Enrolled Courses
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