import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  Typography,
  Space,
  message,
  Card,
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function StudentProfile() {
  const [profileImage, setProfileImage] = useState(null);

  const handleUpload = (info) => {
    const file = info.file.originFileObj;
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      message.success("Profile image updated");
    }
  };

  const onFinish = (values) => {
    console.log(values);
    message.success("Profile saved successfully!");
  };

  return (
    <div
      style={{
        padding: "30px",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
      }}
    >
      <Card
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          borderRadius: "12px",
        }}
      >
        <Title level={2} style={{ textAlign: "center", color: "#1e293b" }}>
          Student Profile
        </Title>

        {/* Profile Photo */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <Avatar
            size={120}
            src={profileImage}
            icon={!profileImage && <UserOutlined />}
          />

          <br />

          <Upload
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleUpload}
          >
            <Button
              icon={<UploadOutlined />}
              style={{ marginTop: "15px" }}
            >
              Change Photo
            </Button>
          </Upload>
        </div>

        {/* Form */}
        <Form
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
          onFinish={onFinish}
        >
          <Form.Item
            label="Student Name"
            name="name"
            rules={[{ required: true, message: "Enter student name" }]}
          >
            <Input placeholder="Enter student name" />
          </Form.Item>

          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true, message: "Enter department" }]}
          >
            <Input placeholder="Enter department" />
          </Form.Item>

          <Form.Item
            label="Student ID"
            name="studentId"
            rules={[{ required: true, message: "Enter Student Id " }]}
          >
            <Input placeholder="Enter register number" />
          </Form.Item>

          <Form.Item
            label="Contact Number"
            name="phone"
            rules={[{ required: true, message: "Enter contact number" }]}
          >
            <Input placeholder="Enter contact number" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Enter email" },
              { type: "email", message: "Enter valid email" },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
              <Button>Update</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}