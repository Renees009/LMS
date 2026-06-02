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
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";

import CourseCard from "./CourseCard";

const { Title } = Typography;
const { Option } = Select;

const API_BASE = "http://localhost:8000";

export default function ExploreCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("");

  const [levelFilter, setLevelFilter] =
    useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_BASE}/api/courses/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "lms_token"
              )}`,
            },
          }
        );

        if (!res.ok) {
          message.error("Failed to load courses");
          return;
        }

        const data = await res.json();

        const list = Array.isArray(data)
          ? data
          : data?.results || [];

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
    ...new Set(
      courses
        .map((c) => c.category)
        .filter(Boolean)
    ),
  ];

  const levels = [
    ...new Set(
      courses
        .map((c) => c.level)
        .filter(Boolean)
    ),
  ];

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      const title = (
        course.title || ""
      ).toLowerCase();

      const category = (
        course.category || ""
      ).toLowerCase();

      const level = (
        course.level || ""
      ).toLowerCase();

      const description = (
        course.description || ""
      ).toLowerCase();

      const q = query.toLowerCase();

      const matchesSearch =
        !q ||
        title.includes(q) ||
        category.includes(q) ||
        level.includes(q) ||
        description.includes(q);

      const matchesCategory =
        !categoryFilter ||
        course.category === categoryFilter;

      const matchesLevel =
        !levelFilter ||
        course.level === levelFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLevel
      );
    });
  }, [
    courses,
    query,
    categoryFilter,
    levelFilter,
  ]);

  const handleSearch = () => {
    setQuery(searchText);
  };

  const clearFilters = () => {
    setSearchText("");
    setQuery("");
    setCategoryFilter("");
    setLevelFilter("");
  };

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        padding: 20,
      }}
    >
      <Title
        level={3}
        style={{
          marginTop: 0,
          color: "#111827",
        }}
      >
        Explore Courses
      </Title>

      <Card
        style={{
          marginBottom: 20,
          borderRadius: 12,
        }}
      >
        <Space
          wrap
          style={{
            width: "100%",
          }}
        >
          <Input
            placeholder="Search by title, category, level, description..."
            value={searchText}
            onChange={(e) =>
              setSearchText(e.target.value)
            }
            style={{
              width: 300,
            }}
            onPressEnter={handleSearch}
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
            value={
              categoryFilter || undefined
            }
            onChange={setCategoryFilter}
            allowClear
            style={{
              width: 180,
            }}
          >
            {categories.map((cat) => (
              <Option
                key={cat}
                value={cat}
              >
                {cat}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Level"
            value={
              levelFilter || undefined
            }
            onChange={setLevelFilter}
            allowClear
            style={{
              width: 180,
            }}
          >
            {levels.map((level) => (
              <Option
                key={level}
                value={level}
              >
                {level}
              </Option>
            ))}
          </Select>

          <Button
            icon={<FilterOutlined />}
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </Space>
      </Card>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[20, 20]}>
          {filtered.map((course) => (
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}
              xl={8}
              key={course.id}
            >
              <CourseCard
                course={course}
              />
            </Col>
          ))}

          {filtered.length === 0 && (
            <Col span={24}>
              <Card
                style={{
                  textAlign: "center",
                  borderRadius: 12,
                }}
              >
                No courses found.
              </Card>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
}