import { useEffect, useMemo, useState } from "react";
import {
  Card,
  List,
  Space,
  Typography,
  Select,
  Divider,
  message,
  Tag,
  Form,
} from "antd";


const { Title, Text } = Typography;
const API_BASE = "http://127.0.0.1:8000";

export default function ViewEnrollments() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  useEffect(() => {
    const loadTutorCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/tutor-courses/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("lms_token")}` },
        });
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.results || [];
        setCourses(list);
        if (!selectedCourseId && list.length) setSelectedCourseId(list[0].id);
      } catch (e) {
        console.error(e);
        message.error("Failed to load your courses");
      } finally {
        setLoading(false);
      }
    };

    loadTutorCourses();
    
  }, []);

  useEffect(() => {
    const loadEnrollments = async () => {
      if (!selectedCourseId) return;
      try {
        setLoading(true);
        
        const res = await fetch(
          `${API_BASE}/api/tutor/courses/${selectedCourseId}/enrollments/`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("lms_token")}` },
          }
        );
        const data = await res.json();
        setEnrollments(Array.isArray(data) ? data : data?.results || []);
      } catch (e) {
        console.error(e);
        message.error("Failed to load enrollments");
      } finally {
        setLoading(false);
      }
    };

    loadEnrollments();
  }, [selectedCourseId]);

  return (
    <div className="p-6">
      <Card className="shadow-lg rounded-xl">
        <Title level={3}>View Enrollments</Title>

        <FormCourseSelector
          courses={courses}
          selectedCourseId={selectedCourseId}
          onChange={setSelectedCourseId}
          loading={loading}
        />

        {selectedCourse && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>Selected:</Text> <Text>{selectedCourse.course_title || selectedCourse.title}</Text>
          </div>
        )}

        <Divider />

        {loading && enrollments.length === 0 ? (
          <Text>Loading...</Text>
        ) : (
          <List
            dataSource={enrollments}
            locale={{ emptyText: "No enrollments yet" }}
            renderItem={(item) => (
              <List.Item>
                <Card size="small" style={{ width: "100%" }}>
                  <Space direction="vertical" size={4}>
                    <div>
                      <Text strong>{item.student_name || item.student || "Student"}</Text>
                    </div>
                    <div>
                      <Tag color={item.completed_at ? "green" : "blue"}>
                        {item.completed_at ? "Completed" : "In Progress"}
                      </Tag>
                    </div>
                    <div>
                      <Text type="secondary">Started: {item.start_date || item.enrolled_at || "-"}</Text>
                    </div>
                    {item.completed_at && (
                      <div>
                        <Text type="secondary">Completed: {item.completed_at}</Text>
                      </div>
                    )}
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}

function FormCourseSelector({ courses, selectedCourseId, onChange, loading }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <Select
        loading={loading}
        value={selectedCourseId}
        onChange={onChange}
        placeholder="Select a course"
        style={{ width: 420 }}
      >
        {courses.map((c) => (
          <Select.Option value={c.id} key={c.id}>
            {c.course_title || c.title}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
}

