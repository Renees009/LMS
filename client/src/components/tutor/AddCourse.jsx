import { useState } from "react";
import {
  Input,
  Button,
  Select,
  Upload,
  Card,
  Space,
  Typography,
  message,
  Divider,
  InputNumber,
  Form,
  Row,
  Col,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";

const { Title, Text } = Typography;
const { TextArea } = Input;

const API_BASE = "http://127.0.0.1:8000";

export default function AddCourse() {
  const [loading, setLoading] = useState(false);

  // useForm hook initialization
  const {
    register,        // Registers input fields with React Hook Form
    handleSubmit,    // Handles form submission
    control,         // Controls custom components like Select, Upload
    watch,           // Watches form field values in real-time
    reset,           // Resets form to default values
    formState: { errors }, // Contains validation errors
  } = useForm({
    defaultValues: {
      number_of_lessons: 0,
      lessons: [],
    },
  });

  // Watch lesson count to dynamically render lesson forms
  const lessonCount = watch("number_of_lessons") || 0;

  const onSubmit = async (values) => {
    try {
      setLoading(true);

      const formData = new FormData();

      // Append basic course information
      formData.append("title", values.title);
      formData.append("category", values.category);
      formData.append("duration", values.duration);
      formData.append("level", values.level);
      formData.append("description", values.description);
      formData.append("number_of_lessons", values.number_of_lessons);

      if (values.thumbnail && values.thumbnail.length > 0) {
        formData.append("thumbnail", values.thumbnail[0].originFileObj);
      }

      const lessonData = [];
      for (let i = 0; i < values.number_of_lessons; i++) {
        lessonData.push({
          title: values.lessons?.[i]?.title || "",
          description: values.lessons?.[i]?.description || "",
        });
      }
      formData.append("lessons", JSON.stringify(lessonData));

      values.lessons?.forEach((lesson, index) => {
        if (lesson?.material && lesson.material.length > 0) {
          formData.append(`lesson_material_${index}`, lesson.material[0].originFileObj);
        }
        if (lesson?.video && lesson.video.length > 0) {
          formData.append(`lesson_video_${index}`, lesson.video[0].originFileObj);
        }
      });

      const response = await fetch(`${API_BASE}/api/course/create/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("lms_token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Course Added Successfully");
        reset(); 
      } else {
        message.error(data.error || "Failed to add course");
      }
    } catch (error) {
      console.error(error);
      message.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#f0f2f6",
        minHeight: "100vh",
        padding: "32px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <Card
          style={{
            borderRadius: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)", 
            border: "1px solid #d9d9d9", 
          }}
          styles={{ body: { padding: "32px" } }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 4,
                height: 32,
                background: "#1890ff",
                borderRadius: 2,
              }}
            />
            <Title
              level={3}
              style={{
                margin: 0,
                color: "#1a1a1a",
                fontWeight: 600,
              }}
            >
              Add New Course
            </Title>
          </div>

          <Form layout="vertical">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{ marginBottom: 24 }}>
                <Form.Item
                  label={
                    <Text strong style={{ fontSize: 14, color: "#1a1a1a" }}>
                      Course Thumbnail
                    </Text>
                  }
                  required
                >
                  <Controller
                    name="thumbnail"
                    control={control}
                    render={({ field }) => (
                      <Upload
                        beforeUpload={() => false}
                        maxCount={1}
                        onChange={(info) => field.onChange(info.fileList)}
                        listType="picture"
                      >
                        <Button icon={<UploadOutlined />}>Upload Thumbnail</Button>
                      </Upload>
                    )}
                  />
                </Form.Item>
              </div>

              <div style={{ marginBottom: 24 }}>
                <Form.Item
                  label={
                    <Text strong style={{ fontSize: 14, color: "#1a1a1a" }}>
                      Course Title
                    </Text>
                  }
                  required
                  validateStatus={errors.title ? "error" : ""}
                  help={errors.title ? "Course title is required" : ""}
                >
                  <Input
                    placeholder="Enter course title"
                    size="large"
                    style={{ borderColor: "#d9d9d9" }}
                    {...register("title", { required: true })}
                  />
                </Form.Item>
              </div>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 24 }}>
                    <Form.Item
                      label={
                        <Text strong style={{ fontSize: 14, color: "#1a1a1a" }}>
                          Course Category
                        </Text>
                      }
                      required
                      validateStatus={errors.category ? "error" : ""}
                      help={errors.category ? "Category is required" : ""}
                    >
                      <Controller
                        name="category"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            placeholder="Select Category"
                            size="large"
                            style={{ borderColor: "#d9d9d9" }}
                          >
                            <Select.Option value="Programming">Programming</Select.Option>
                            <Select.Option value="Web Development">Web Development</Select.Option>
                            <Select.Option value="AI">AI</Select.Option>
                            <Select.Option value="Others">Others</Select.Option>
                          </Select>
                        )}
                      />
                    </Form.Item>
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 24 }}>
                    <Form.Item
                      label={
                        <Text strong style={{ fontSize: 14, color: "#1a1a1a" }}>
                          Course Level
                        </Text>
                      }
                      required
                      validateStatus={errors.level ? "error" : ""}
                      help={errors.level ? "Level is required" : ""}
                    >
                      <Controller
                        name="level"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            placeholder="Select Level"
                            size="large"
                            style={{ borderColor: "#d9d9d9" }}
                          >
                            <Select.Option value="Beginner">Beginner</Select.Option>
                            <Select.Option value="Intermediate">Intermediate</Select.Option>
                            <Select.Option value="Advanced">Advanced</Select.Option>
                          </Select>
                        )}
                      />
                    </Form.Item>
                  </div>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 24 }}>
                    <Form.Item
                      label={
                        <Text strong style={{ fontSize: 14, color: "#1a1a1a" }}>
                          Course Duration
                        </Text>
                      }
                      required
                      validateStatus={errors.duration ? "error" : ""}
                      help={errors.duration ? "Duration is required" : ""}
                    >
                      <Input
                        placeholder="e.g., 10 Hours"
                        size="large"
                        style={{ borderColor: "#d9d9d9" }}
                        {...register("duration", { required: true })}
                      />
                    </Form.Item>
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 24 }}>
                    <Form.Item
                      label={
                        <Text strong style={{ fontSize: 14, color: "#1a1a1a" }}>
                          Number of Lessons
                        </Text>
                      }
                    >
                      <Controller
                        name="number_of_lessons"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            min={1}
                            size="large"
                            style={{
                              width: "100%",
                              borderColor: "#d9d9d9",
                            }}
                            placeholder="Enter number of lessons"
                          />
                        )}
                      />
                    </Form.Item>
                  </div>
                </Col>
              </Row>
              <div style={{ marginBottom: 24 }}>
                <Form.Item
                  label={
                    <Text strong style={{ fontSize: 14, color: "#1a1a1a" }}>
                      Course Description
                    </Text>
                  }
                  required
                  validateStatus={errors.description ? "error" : ""}
                  help={errors.description ? "Description is required" : ""}
                >
                  <TextArea
                    rows={4}
                    placeholder="Course Description"
                    size="large"
                    style={{ borderColor: "#d9d9d9" }}
                    {...register("description", { required: true })}
                  />
                </Form.Item>
              </div>

              <Divider style={{ borderColor: "#d9d9d9" }} />

              {lessonCount > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        height: 24,
                        background: "#52c41a",
                        borderRadius: 2,
                      }}
                    />
                    <Title
                      level={4}
                      style={{
                        margin: 0,
                        color: "#1a1a1a",
                        fontWeight: 600,
                      }}
                    >
                      Course Lessons
                    </Title>
                  </div>

                  {Array.from({ length: lessonCount }).map((_, index) => (
                    <Card
                      key={index}
                      style={{
                        marginBottom: 20,
                        borderRadius: 12,
                        background: "#fafafa",
                        border: "1px solid #d9d9d9",

                      }}
                      styles={{ body: { padding: "20px" } }}
                    >
                      <Title
                        level={5}
                        style={{
                          marginBottom: 16,
                          color: "#1890ff",
                        }}
                      >
                        Lesson {index + 1}
                      </Title>
                      <div style={{ marginBottom: 20 }}>
                        <Form.Item
                          label={<Text strong style={{ color: "#1a1a1a" }}>Lesson Title</Text>}
                          required
                          validateStatus={errors.lessons?.[index]?.title ? "error" : ""}
                          help={errors.lessons?.[index]?.title ? "Lesson title is required" : ""}
                        >
                          <Input
                            placeholder="Lesson Title"
                            size="large"
                            style={{ borderColor: "#d9d9d9" }}
                            {...register(`lessons.${index}.title`, { required: true })}
                          />
                        </Form.Item>
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <Form.Item
                          label={<Text strong style={{ color: "#1a1a1a" }}>Lesson Description</Text>}
                          required
                          validateStatus={errors.lessons?.[index]?.description ? "error" : ""}
                          help={
                            errors.lessons?.[index]?.description ? "Lesson description is required" : ""
                          }
                        >
                          <TextArea
                            rows={3}
                            placeholder="Lesson Description"
                            style={{ borderColor: "#d9d9d9" }}
                            {...register(`lessons.${index}.description`, { required: true })}
                          />
                        </Form.Item>
                      </div>

                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item label={<Text strong style={{ color: "#1a1a1a" }}>Course Material</Text>}>
                            <Controller
                              name={`lessons.${index}.material`}
                              control={control}
                              render={({ field }) => (
                                <Upload
                                  beforeUpload={() => false}
                                  maxCount={1}
                                  onChange={(info) => field.onChange(info.fileList)}
                                >
                                  <Button icon={<UploadOutlined />}>Upload Material</Button>
                                </Upload>
                              )}
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item label={<Text strong style={{ color: "#1a1a1a" }}>Video</Text>}>
                            <Controller
                              name={`lessons.${index}.video`}
                              control={control}
                              render={({ field }) => (
                                <Upload
                                  beforeUpload={() => false}
                                  maxCount={1}
                                  onChange={(info) => field.onChange(info.fileList)}
                                >
                                  <Button icon={<UploadOutlined />}>Upload Video</Button>
                                </Upload>
                              )}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              )}

              <Divider style={{ borderColor: "#d9d9d9" }} />

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                }}
              >
                <Button size="large" onClick={() => reset()}>
                  Reset
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  style={{
                    borderRadius: 8,
                    fontWeight: 500,
                  }}
                >
                  Upload Course
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}