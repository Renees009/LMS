import { useState } from "react";
import {
  Form,
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
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { TextArea } = Input;

const API_BASE = "http://127.0.0.1:8000";

export default function AddCourse() {
  const [form] = Form.useForm();
  const [lessonCount, setLessonCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleLessonCount = (value) => {
    setLessonCount(value || 0);
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("category", values.category);
      formData.append("duration", values.duration);
      formData.append("level", values.level);
      formData.append("description", values.description);
      formData.append("number_of_lessons", values.number_of_lessons);

      if (values.thumbnail?.file) {
        formData.append("thumbnail", values.thumbnail.file.originFileObj);
      }

      const lessons = [];

      for (let i = 0; i < values.number_of_lessons; i++) {
        const lesson = {
          title: values.lessons?.[i]?.title,
          description: values.lessons?.[i]?.description,
        };

        lessons.push(lesson);
      }

      formData.append("lessons", JSON.stringify(lessons));

      values.lessons?.forEach((lesson, index) => {
        if (lesson.material?.file) {
          formData.append(
            `lesson_material_${index}`,
            lesson.material.file.originFileObj
          );
        }

        if (lesson.video?.file) {
          formData.append(
            `lesson_video_${index}`,
            lesson.video.file.originFileObj
          );
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
        form.resetFields();
        setLessonCount(0);
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
    <div className="p-6">
      <Card className="shadow-lg rounded-xl">
        <Title level={3}>Add Course</Title>

        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
        >
          
          <Form.Item
            label="Course Thumbnail"
            name="thumbnail"
            valuePropName="file"
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>
                Upload Thumbnail
              </Button>
            </Upload>
          </Form.Item>

          
          <Form.Item
            label="Course Title"
            name="title"
            rules={[
              {
                required: true,
                message: "Please enter course title",
              },
            ]}
          >
            <Input placeholder="Enter course title" />
          </Form.Item>

          <Form.Item
            label="Course Category"
            name="category"
            rules={[
              {
                required: true,
                message: "Please select category",
              },
            ]}
          >
            <Select placeholder="Select category">
              <Select.Option value="Programming">
                Programming
              </Select.Option>

              <Select.Option value="Web Development">
                Web Development
              </Select.Option>

              <Select.Option value="AI">
                AI
              </Select.Option>

              
              <Select.Option value="Data Science">
                Others
              </Select.Option>
            </Select>
          </Form.Item>
            

          <Form.Item
            label="Course Duration"
            name="duration"
            rules={[
              {
                required: true,
                message: "Enter course duration",
              },
            ]}
          >
            <Input placeholder="Example: 10 Hours" />
          </Form.Item>

          <Form.Item
            label="Course Level"
            name="level"
            rules={[
              {
                required: true,
                message: "Select level",
              },
            ]}
          >
            <Select placeholder="Select level">
              <Select.Option value="Beginner">
                Beginner 
              </Select.Option>

              <Select.Option value="Intermediate">
                Intermediate
              </Select.Option>

              <Select.Option value="Advanced">
                Advanced
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: "Enter course description",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter course description"
            />
          </Form.Item>

          {/* Number of Lessons */}
          <Form.Item
            label="Number of Lessons"
            name="number_of_lessons"
            rules={[
              {
                required: true,
                message: "Enter number of lessons",
              },
            ]}
          >
            <InputNumber
              min={1}
              className="w-full"
              placeholder="Enter number of lessons"
              onChange={handleLessonCount}
            />
          </Form.Item>

          {Array.from({ length: lessonCount }).map((_, index) => (
            <Card
              key={index}
              className="mb-5 border rounded-xl"
              title={`Lesson ${index + 1}`}
            >
              <Form.Item
                label="Lesson Title"
                name={["lessons", index, "title"]}
                rules={[
                  {
                    required: true,
                    message: "Enter lesson title",
                  },
                ]}
              >
                <Input placeholder="Enter lesson title" />
              </Form.Item>

              <Form.Item
                label="Lesson Description"
                name={["lessons", index, "description"]}
                rules={[
                  {
                    required: true,
                    message: "Enter lesson description",
                  },
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="Enter lesson description"
                />
              </Form.Item>

              {/* Course Material */}
              <Form.Item
                label="Course Material"
                name={["lessons", index, "material"]}
                valuePropName="file"
              >
                <Upload beforeUpload={() => false} maxCount={1}>
                  <Button icon={<UploadOutlined />}>
                    Upload Material
                  </Button>
                </Upload>
              </Form.Item>

              {/* Video */}
              <Form.Item
                label="Video"
                name={["lessons", index, "video"]}
                valuePropName="file"
              >
                <Upload beforeUpload={() => false} maxCount={1}>
                  <Button icon={<UploadOutlined />}>
                    Upload Video
                  </Button>
                </Upload>
              </Form.Item>
            </Card>
          ))}


          <Divider />

          {/* Submit */}
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              
            >
              Upload course
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}