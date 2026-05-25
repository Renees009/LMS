import { useState } from "react";
import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  Card,
  Typography,
  message,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function AddCourse() {
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log(values);
    message.success("Course added successfully!");
    form.resetFields();
    setThumbnail(null);
  };

  const thumbnailProps = {
    beforeUpload: (file) => {
      setThumbnail(URL.createObjectURL(file));
      return false;
    },
    maxCount: 1,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "30px",
      }}
    >
      <Card
        style={{
          maxWidth: 900,
          margin: "auto",
          borderRadius: 12,
        }}
      >
        <Title
          level={2}
          style={{ textAlign: "center" }}
        >
          Add New Course
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {/* Thumbnail */}
          <Form.Item label="Course Thumbnail">
            <div style={{ textAlign: "center" }}>
              <img
                src={
                  thumbnail ||
                  "https://via.placeholder.com/180x120?text=Course+Image"
                }
                alt="thumbnail"
                style={{
                  width: 180,
                  height: 120,
                  borderRadius: 8,
                  marginBottom: 15,
                }}
              />

              <Upload {...thumbnailProps}>
                <Button icon={<UploadOutlined />}>
                  Upload Thumbnail
                </Button>
              </Upload>
            </div>
          </Form.Item>

          <Form.Item
            label="Course Title"
            name="title"
            rules={[
              { required: true, message: "Enter course title" },
            ]}
          >
            <Input placeholder="Enter course title" />
          </Form.Item>

          <Form.Item
            label="Tutor Details"
            name="tutor"
            rules={[
              { required: true, message: "Enter tutor details" },
            ]}
          >
            <Input placeholder="Enter tutor details" />
          </Form.Item>

          <Form.Item
            label="Course Category"
            name="category"
            rules={[
              { required: true, message: "Select category" },
            ]}
          >
            <Select
              placeholder="Select category"
              onChange={(value) => setCategory(value)}
            >
              <Option value="Programming">Programming</Option>
              <Option value="Web Development">
                Web Development
              </Option>
              <Option value="UI/UX Design">
                UI/UX Design
              </Option>
              <Option value="Data Science">
                Data Science
              </Option>
              <Option value="Others">Others</Option>
            </Select>
          </Form.Item>

          {category === "Others" && (
            <Form.Item
              label="New Category"
              name="newCategory"
              rules={[
                {
                  required: true,
                  message: "Enter new category",
                },
              ]}
            >
              <Input placeholder="Enter course category" />
            </Form.Item>
          )}

          <Form.Item
            label="Course Duration"
            name="duration"
          >
            <Input placeholder="e.g. 8 weeks" />
          </Form.Item>

          <Form.Item
            label="Course Level"
            name="level"
          >
            <Select placeholder="Select level">
              <Option value="Beginner">Beginner</Option>
              <Option value="Intermediate">
                Intermediate
              </Option>
              <Option value="Advanced">Advanced</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="Enter course description"
            />
          </Form.Item>

          <Form.Item label="Upload Videos">
            <Upload
              multiple
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>
                Upload Videos
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item label="Course Materials">
            <Upload
              multiple
              beforeUpload={() => false}
            >
              <Button icon={<PlusOutlined />}>
                Upload PDFs / PPTs
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item style={{ textAlign: "center" }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
            >
              Add Course
            </Button>

            <Button
              htmlType="reset"
              size="large"
              style={{ marginLeft: 15 }}
            >
              Reset
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}