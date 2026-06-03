import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  Row,
  Input,
  Spin,
  Typography,
  message,
  Button,
  Select,
  Space,
  Badge,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  BookOutlined,
} from "@ant-design/icons";

import CourseCard from "./CourseCard";

const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE = "http://localhost:8000";

export default function ExploreCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

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

  const categories = [
    ...new Set(courses.map((c) => c.category).filter(Boolean)),
  ];

  const levels = [
    ...new Set(courses.map((c) => c.level).filter(Boolean)),
  ];

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      const title = (course.title || "").toLowerCase();
      const category = (course.category || "").toLowerCase();
      const level = (course.level || "").toLowerCase();
      const description = (course.description || "").toLowerCase();

      const q = query.toLowerCase();

      const matchesSearch =
        !q ||
        title.includes(q) ||
        category.includes(q) ||
        level.includes(q) ||
        description.includes(q);

      const matchesCategory = !categoryFilter || course.category === categoryFilter;
      const matchesLevel = !levelFilter || course.level === levelFilter;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, query, categoryFilter, levelFilter]);

  const handleSearch = () => {
    setQuery(searchText);
  };

  const clearFilters = () => {
    setSearchText("");
    setQuery("");
    setCategoryFilter("");
    setLevelFilter("");
  };

  const activeFiltersCount = [query, categoryFilter, levelFilter].filter(Boolean).length;

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
          margin: "0 auto 24px auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
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
                Explore Courses
              </Title>
            </div>
          </div>

        </div>

        <Card
          style={{
            marginBottom: 24,
            borderRadius: 12,
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          }}
          styles={{ body: { padding: "16px 20px" } }}
        >
          <Space wrap size="middle" style={{ width: "100%" }}>
            <Input
              placeholder="Search by title, category, level..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: 280,
                borderRadius: 8,
              }}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            />

            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              Search
            </Button>

            <Select
              placeholder="Category"
              value={categoryFilter || undefined}
              onChange={setCategoryFilter}
              allowClear
              style={{
                width: 160,
              }}
            >
              {categories.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Level"
              value={levelFilter || undefined}
              onChange={setLevelFilter}
              allowClear
              style={{
                width: 160,
              }}
            >
              {levels.map((level) => (
                <Option key={level} value={level}>
                  {level}
                </Option>
              ))}
            </Select>

            <Button icon={<FilterOutlined />} onClick={clearFilters}>
              Clear
            </Button>
          </Space>

          {activeFiltersCount > 0 && (
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                Active filters:
              </Text>
              {query && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "2px 10px",
                    background: "#e6f7ff",
                    borderRadius: 4,
                    fontSize: 12,
                    color: "#1890ff",
                  }}
                >
                  Search: {query}
                  <span
                    onClick={() => {
                      setQuery("");
                      setSearchText("");
                    }}
                    style={{ cursor: "pointer", fontSize: 14 }}
                  >
                    ×
                  </span>
                </span>
              )}
              {categoryFilter && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "2px 10px",
                    background: "#f6ffed",
                    borderRadius: 4,
                    fontSize: 12,
                    color: "#52c41a",
                  }}
                >
                  Category: {categoryFilter}
                  <span
                    onClick={() => setCategoryFilter("")}
                    style={{ cursor: "pointer", fontSize: 14 }}
                  >
                    ×
                  </span>
                </span>
              )}
              {levelFilter && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "2px 10px",
                    background: "#f9f0ff",
                    borderRadius: 4,
                    fontSize: 12,
                    color: "#722ed1",
                  }}
                >
                  Level: {levelFilter}
                  <span
                    onClick={() => setLevelFilter("")}
                    style={{ cursor: "pointer", fontSize: 14 }}
                  >
                    ×
                  </span>
                </span>
              )}
            </div>
          )}
        </Card>
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
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          
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
            {filtered.map((course) => (
              <Col xs={24} sm={12} md={12} lg={8} xl={6} key={course.id}>
                <CourseCard course={course} />
              </Col>
            ))}

            {filtered.length === 0 && (
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
                    No courses found
                  </Title>
                  <Text style={{ color: "#999" }}>
                    Try adjusting your search or filters
                  </Text>
                  <div style={{ marginTop: 20 }}>
                    <Button onClick={clearFilters}>Clear all filters</Button>
                  </div>
                </Card>
              </Col>
            )}
          </Row>
        </div>
      )}
    </div>
  );
}