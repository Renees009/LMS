import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Tabs,
  Form,
  Input,
  Button,
  Upload,
  message,
  Card,
  List,
  Modal,
  Space,
  InputNumber,
  Select,
  Divider,
  Spin,
  Empty,
  Tag,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  BookOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

const API_BASE = "http://localhost:8000";

export default function ManageLessons() {
  const params = useParams();
  const courseId = params.courseId || params.id;
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [isLessonModalVisible, setIsLessonModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm] = Form.useForm();
  const [courseForm] = Form.useForm();

  const fetchAllData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = localStorage.getItem("lms_token");
      const headers = { Authorization: `Bearer ${token}` };

      const courseRes = await fetch(`${API_BASE}/api/courses/${courseId}/`, { headers });
      if (courseRes.ok) {
        const courseData = await courseRes.json();
        setCourse(courseData);
        courseForm.setFieldsValue(courseData);
      }

      const lessonsRes = await fetch(`${API_BASE}/api/courses/${courseId}/lessons/`, { headers });
      if (lessonsRes.ok) {
        const data = await lessonsRes.json();
        setLessons(Array.isArray(data) ? data : data.results || []);
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      message.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!courseId || courseId === "undefined") {
      message.error("Invalid Course Selection");
      navigate("/tutor/courses");
      return;
    }
    fetchAllData();
  }, [courseId]);

  const handleUpdateCourse = async (values) => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("category", values.category);
      formData.append("level", values.level);
      formData.append("duration", values.duration);
      formData.append("description", values.description);

      if (values.thumbnail?.fileList?.[0]?.originFileObj) {
        formData.append("thumbnail", values.thumbnail.fileList[0].originFileObj);
      }

      const res = await fetch(`${API_BASE}/api/tutor/courses/${courseId}/`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("lms_token")}` },
        body: formData,
      });

      if (res.ok) {
        message.success("Course updated successfully");
        fetchAllData(true);
      } else {
        message.error("Failed to update course");
      }
    } catch (error) {
      message.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLesson = async (values) => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description || "");
      if (values.video?.fileList?.[0]?.originFileObj) {
        formData.append("video", values.video.fileList[0].originFileObj);
      }
      if (values.material?.fileList?.[0]?.originFileObj) {
        formData.append("material", values.material.fileList[0].originFileObj);
      }

      const url = editingLesson
        ? `${API_BASE}/api/tutor/courses/${courseId}/lessons/${editingLesson.id}/`
        : `${API_BASE}/api/tutor/courses/${courseId}/lessons/`;
      
      const method = editingLesson ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${localStorage.getItem("lms_token")}` },
        body: formData,
      });

      let data = {};
      try {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        }
      } catch (e) {
        console.error("Error parsing response JSON:", e);
      }

      if (res.ok) {
        message.success(`Lesson ${editingLesson ? "updated" : "added"} successfully`);
        setIsLessonModalVisible(false);
        setEditingLesson(null);
        lessonForm.resetFields();
        fetchAllData(true);
      } else {
        const errorMsg = data.detail || data.error || 
                        (typeof data === 'object' ? Object.values(data)[0] : null) || 
                        "Failed to save lesson";
        message.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
      }
    } catch (error) {
      message.error("Failed to save lesson");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "100px" }}><Spin size="large" /></div>;

  const tabItems = [
    {
      key: "1",
      label: (
        <span>
          <InfoCircleOutlined /> Details
        </span>
      ),
      children: (
        <Card bordered={false}>
              <Form
                form={courseForm}
                layout="vertical"
                onFinish={handleUpdateCourse}
              >
                <Form.Item name="title" label="Course Title" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>

                {course?.thumbnail && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Current Thumbnail:</Text>
                    <br />
                    <img
                      src={typeof course.thumbnail === 'string' && course.thumbnail.startsWith('http') ? course.thumbnail : `${API_BASE}${course.thumbnail}`}
                      alt="Current Thumbnail" 
                      style={{ width: 200, borderRadius: 8, marginTop: 8, border: "1px solid #d9d9d9" }} 
                    />
                  </div>
                )}

                <Space style={{ display: "flex" }} align="start">
                  <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                    <Select style={{ width: 200 }}>
                      <Select.Option value="Programming">Programming</Select.Option>
                      <Select.Option value="Web Development">Web Development</Select.Option>
                      <Select.Option value="AI">AI</Select.Option>
                      <Select.Option value="Others">Others</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="level" label="Level" rules={[{ required: true }]}>
                    <Select style={{ width: 200 }}>
                      <Select.Option value="Beginner">Beginner</Select.Option>
                      <Select.Option value="Intermediate">Intermediate</Select.Option>
                      <Select.Option value="Advanced">Advanced</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="duration" label="Duration (Hours)" rules={[{ required: true }]}>
                    <InputNumber min={1} />
                  </Form.Item>
                </Space>
                <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                  <TextArea rows={4} />
                </Form.Item>
                <Form.Item name="thumbnail" label="Update Thumbnail">
                  <Upload beforeUpload={() => false} maxCount={1}>
                    <Button icon={<UploadOutlined />}>Select Image</Button>
                  </Upload>
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={saving}>Save Changes</Button>
              </Form>
            </Card>
      ),
    },
    {
      key: "2",
      label: (
        <span>
          <BookOutlined /> Lessons
        </span>
      ),
      children: (
        <>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingLesson(null);
                  lessonForm.resetFields();
                  setIsLessonModalVisible(true);
                }}
              >
                Add Lesson
              </Button>
            </div>
            <List
              itemLayout="horizontal"
              dataSource={lessons}
              renderItem={(item, index) => (
                <List.Item
                  key={item.id || index}
                >
                  <List.Item.Meta
                    title={<Text strong>Lesson {item.order || index + 1}: {item.title}</Text>}
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary">{item.description}</Text>
                        <Space wrap>
                          {item.video_file ? <Tag color="blue">Video Attached</Tag> : <Tag color="default">No Video</Tag>}
                          {item.material_file ? <Tag color="green">Material Attached</Tag> : <Tag color="default">No Material</Tag>}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
        </>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Title level={2}>{course?.title || "Manage Course"}</Title>
        <Divider />

        <Tabs defaultActiveKey="1" type="card" items={tabItems} />
      </div>

      {/* Lesson Add/Edit Modal */}
      <Modal
        title={editingLesson ? "Edit Lesson" : "Add New Lesson"}
        open={isLessonModalVisible}
        onCancel={() => {
          setIsLessonModalVisible(false);
          setEditingLesson(null);
          lessonForm.resetFields();
        }}
        onOk={() => lessonForm.submit()}
        destroyOnClose
      >
        <Form form={lessonForm} layout="vertical" onFinish={handleSaveLesson}>
          <Form.Item name="title" label="Lesson Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="video" label="Video Content">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload Video</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="material" label="Study Material (PDF/Doc)">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload Material</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}