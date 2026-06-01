import { useEffect, useMemo, useState } from "react";
import {
  Card,
  List,
  Space,
  Typography,
  Select,
  Divider,
  message,
  Button,
  Form,
  Input,
  Upload,
  Tag,
} from "antd";

import { UploadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const API_BASE = "http://127.0.0.1:8000";

export default function ManageLessons() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const [lessons, setLessons] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);

  const [activeLessonId, setActiveLessonId] = useState(null);
  const [saving, setSaving] = useState(false);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === activeLessonId) || null,
    [lessons, activeLessonId]
  );

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${localStorage.getItem("lms_token")}` }),
    []
  );

  useEffect(() => {
    const loadTutorCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await fetch(`${API_BASE}/api/tutor-courses/`, {
          headers: authHeaders,
        });
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.results || [];
        setCourses(list);
        if (!selectedCourseId && list.length) {
          setSelectedCourseId(list[0].id);
        }
      } catch (e) {
        console.error(e);
        message.error("Failed to load your courses");
      } finally {
        setLoadingCourses(false);
      }
    };

    loadTutorCourses();
    
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadLessons = async () => {
      if (!selectedCourseId) return;
      try {
        setLoadingLessons(true);

        const realCourseId = selectedCourse?.course_id ?? selectedCourseId;

        const res = await fetch(
          `${API_BASE}/api/courses/${realCourseId}/lessons/`,
          {
            headers: authHeaders,
          }
        );
        const data = await res.json();
        if (cancelled) return;

        const list = Array.isArray(data) ? data : data?.results || [];
        setLessons(list);

        if (!activeLessonId && list.length) {
          const first = list[0];
          setActiveLessonId(first?.id ?? null);
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          message.error("Failed to load lessons");
        }
      } finally {
        if (!cancelled) setLoadingLessons(false);
      }
    };

    loadLessons();
    return () => {
      cancelled = true;
    };
   
  }, [selectedCourseId]);

  const updateLesson = async (lessonId, payload) => {
   
    const tutorCourseId = selectedCourseId;
    const formData = new FormData();

    if (payload.title !== undefined) formData.append("title", payload.title);
    if (payload.description !== undefined) formData.append("description", payload.description);

    if (payload.materialFile) formData.append("material", payload.materialFile);
    if (payload.videoFile) formData.append("video", payload.videoFile);

    const res = await fetch(
      `${API_BASE}/api/tutor/courses/${tutorCourseId}/lessons/${lessonId}/`,
      {
        method: "PUT",
        headers: authHeaders,
        body: formData,
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.detail || data?.error || "Failed to update lesson");
    }
    return data;
  };

  return (
    <div className="p-6">
      <Card className="shadow-lg rounded-xl">
        <Title level={3}>Manage Lessons</Title>

        <Divider />

        <CourseSelector
          courses={courses}
          selectedCourseId={selectedCourseId}
          onChange={(id) => {
            setSelectedCourseId(id);
            setActiveLessonId(null);
          }}
          loading={loadingCourses}
        />

        {selectedCourse && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>Selected course:</Text> <Text>{selectedCourse.course_title || selectedCourse.title}</Text>
            <div>
              <Text type="secondary">Category: {selectedCourse.course_category || selectedCourse.category || "-"}</Text>
            </div>
            <div>
              <Text type="secondary">Duration: {selectedCourse.course_duration || selectedCourse.duration || "-"}</Text>
            </div>
            <div>
              <Text type="secondary">Level: {selectedCourse.course_level || selectedCourse.level || "-"}</Text>
            </div>
            <div>
              <Text type="secondary">Description: {selectedCourse.course_description || selectedCourse.description || "-"}</Text>
            </div>
          </div>
        )}


        <Divider />

        <Space style={{ width: "100%" }} align="start" size={24}>
          <div style={{ flex: 1, minWidth: 320 }}>
            <Card size="small" title="Lessons" loading={loadingLessons}>
              {loadingLessons ? (
                <Text>Loading...</Text>
              ) : (
                <List
                  dataSource={lessons}
                  locale={{ emptyText: "No lessons found" }}
                  renderItem={(lesson) => (
                    <List.Item>
                      <Card
                        size="small"
                        style={{ width: "100%", borderColor: lesson.id === activeLessonId ? "#1677ff" : undefined }}
                      >
                        <Space direction="vertical" size={2} style={{ width: "100%" }}>
                          <div>
                            <Text strong>{lesson.title || `Lesson ${lesson.order}`}</Text>
                          </div>
                          <div>
                            {lesson.video_url ? <Tag color="purple">Video</Tag> : null}
                            {lesson.material_url ? <Tag color="green">Material</Tag> : null}
                          </div>
                          <Button
                            size="small"
                            type={lesson.id === activeLessonId ? "primary" : "default"}
                            onClick={() => setActiveLessonId(lesson.id)}
                          >
                            Edit
                          </Button>
                        </Space>
                      </Card>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </div>

          <div style={{ flex: 1, minWidth: 360 }}>
            <Card size="small" title="Edit lesson">
              {!activeLesson ? (
                <Text type="secondary">Select a lesson to edit.</Text>
              ) : (
                <EditLessonForm
                  key={activeLesson.id}
                  lesson={activeLesson}
                  saving={saving}
                  onSavingChange={setSaving}
                  onSubmit={async (values) => {
                    setSaving(true);
                    try {
                      await updateLesson(activeLesson.id, values);
                      message.success("Lesson updated");
                      // Optimistically refresh lesson list entry
                      const updated = {
                        ...activeLesson,
                        ...values,
                      };
                      setLessons((prev) => prev.map((l) => (l.id === activeLesson.id ? { ...l, ...updated } : l)));
                    } catch (e) {
                      console.error(e);
                      message.error(e.message || "Failed to update lesson");
                    } finally {
                      setSaving(false);
                    }
                  }}
                />
              )}
            </Card>
          </div>
        </Space>
      </Card>
    </div>
  );
}

function CourseSelector({ courses, selectedCourseId, onChange, loading }) {
  return (
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
  );
}

function EditLessonForm({ lesson, saving, onSavingChange, onSubmit }) {
  const [form] = Form.useForm();
  const [materialFile, setMaterialFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => {
    form.setFieldsValue({
      title: lesson.title || "",
      description: lesson.description || "",
    });

    // Reset upload picks after re-render
    setMaterialFile(null);
    setVideoFile(null);
  }, [form, lesson.title, lesson.description]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={async (values) => {
        onSavingChange(true);
        await onSubmit({
          title: values.title,
          description: values.description,
          materialFile,
          videoFile,
        });
        onSavingChange(false);
      }}
    >
      <Form.Item label="Lesson Title" name="title" rules={[{ required: true, message: "Enter title" }]}>
        <Input />
      </Form.Item>

      <Form.Item label="Lesson Description" name="description" rules={[{ required: true, message: "Enter description" }]}>
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item label="Material" extra="Optional. Upload a file to replace material.">
        <Upload
          beforeUpload={(file) => {
            setMaterialFile(file);
            return false;
          }}
          showUploadList={false}
          accept="*/*"
        >
          <Button icon={<UploadOutlined />}>Upload Material</Button>
        </Upload>
      </Form.Item>

      <Form.Item label="Video" extra="Optional. Upload a file to replace video.">
        <Upload
          beforeUpload={(file) => {
            setVideoFile(file);
            return false;
          }}
          showUploadList={false}
          accept="*/*"
        >
          <Button icon={<UploadOutlined />}>Upload Video</Button>
        </Upload>
      </Form.Item>

      <Divider />

      <Space>
        <Button type="primary" htmlType="submit" loading={saving}>
          Save Changes
        </Button>
      </Space>
    </Form>
  );
}

