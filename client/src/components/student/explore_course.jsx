import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row, Input, Spin, Typography, message } from "antd";
import CourseCard from "./_course_card";

const { Title } = Typography;

const API_BASE = "http://localhost:8000";

export default function ExploreCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => {
      const title = (c.title || "").toLowerCase();
      const cat = (c.category || "").toLowerCase();
      const level = (c.level || "").toLowerCase();
      const desc = (c.description || "").toLowerCase();
      return title.includes(q) || cat.includes(q) || level.includes(q) || desc.includes(q);
    });
  }, [courses, query]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_BASE}/api/courses/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("lms_token")}`,
          },
        });

        if (!res.ok) {
          message.error("Failed to load courses");
          return;
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.results || [];
        setCourses(list);
      } catch (e) {
        console.error(e);
        message.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: 20 }}>
      <Title level={3} style={{ marginTop: 0, color: "#111827" }}>
        Explore Courses
      </Title>

      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Input
          placeholder="Search by title, category, level, or description"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Card>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((course) => (
            <Col xs={24} sm={12} md={8} key={course.id}>
              <CourseCard course={course} />
            </Col>
          ))}

          {filtered.length === 0 ? (
            <Col span={24}>
              <div style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
                No courses found.
              </div>
            </Col>
          ) : null}
        </Row>
      )}
    </div>
  );
}

