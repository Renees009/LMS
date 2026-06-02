import { useEffect, useState } from "react";
import { Card, Col, Row, Spin, Tag, Typography, message } from "antd";
import CourseCard from "./CourseCard";

const { Title } = Typography;
const API_BASE = "http://localhost:8000";

export default function EnrolledCourse() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
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

    load();
  }, []);

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: 20 }}>
      <Title level={3} style={{ marginTop: 0, color: "#111827" }}>
        Enrolled Courses
      </Title>

  
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          
          {enrollments.map((e) => (
            <Col xs={24}
            sm={24}
            md={12}
            lg={12} key={e.id}>
              <CourseCard
                course={e}
                enrollmentMeta={{ status: e.status, enrolled_at: e.enrolled_at }}
              />
            </Col>
          ))}

          {enrollments.length === 0 ? (
            <Col span={24}>
              <div style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
                You are not enrolled in any course.
              </div>
            </Col>
          ) : null}
        </Row>
      )}
    </div>
  );
}

