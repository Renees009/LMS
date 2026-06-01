import { useEffect, useState } from "react";
import { Card, Col, Row, Spin, Typography, Tag, message } from "antd";
import CourseCard from "./_course_card";

const { Title } = Typography;
const API_BASE = "http://localhost:8000";

export default function CompletedCourse() {
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/me/completions/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("lms_token")}`,
          },
        });

        if (!res.ok) {
          message.error("Failed to load completed courses");
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

    load();
  }, []);

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: 20 }}>
      <Title level={3} style={{ marginTop: 0, color: "#111827" }}>
        Completed Courses
      </Title>

      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Tag color="green">{completions.length} completed</Tag>
      </Card>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {completions.map((c) => (
            <Col xs={24} sm={12} md={8} key={c.id}>
              <CourseCard
                course={c}
                completionMeta={{
                  completed_date: c.completed_date,
                  tutor_details: c.tutor_details,
                }}
              />
            </Col>
          ))}

          {completions.length === 0 ? (
            <Col span={24}>
              <div style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
                No completed courses yet.
              </div>
            </Col>
          ) : null}
        </Row>
      )}
    </div>
  );
}

