import { useEffect, useRef, useState } from "react";
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
  Tag,
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const API_BASE = "http://localhost:8000";

export default function StudentProfile() {
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState("");
  const selectedFileRef = useRef(null);

  const [form] = Form.useForm();

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/student/me/profile/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("lms_token")}`,
        },
      });
      if (!res.ok) {
        message.error("Failed to load profile");
        return;
      }
      const data = await res.json();

      form.setFieldsValue({
        name: data.student_name || "",
        phone: data.phone || "",
        email: data.email || "",
        bio: data.bio || "",
      });

      setUserName(data.student_name || "");
      setProfileImage(data.profile_image || null);
    } catch (e) {
      console.error(e);
      message.error("Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpload = (info) => {
    const file = info.file.originFileObj;
    if (file) {
      selectedFileRef.current = file;
      setProfileImage(URL.createObjectURL(file));
      message.success("Profile image selected");
    }
  };

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      // backend expects student_name/email/phone/bio
      formData.append("student_name", values.name);
      if (values.email !== undefined) formData.append("email", values.email);
      if (values.phone !== undefined) formData.append("phone", values.phone);
      if (values.bio !== undefined) formData.append("bio", values.bio);

      if (selectedFileRef.current) {
        formData.append("profile_image", selectedFileRef.current);
      }

      const res = await fetch(`${API_BASE}/api/student/me/profile/`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("lms_token")}`,
        },
      });

      if (!res.ok) {
        message.error("Failed to save profile");
        return;
      }

      message.success("Profile saved successfully!");
      selectedFileRef.current = null;
      await fetchProfile();
    } catch (e) {
      console.error(e);
      message.error("Failed to save profile");
    }
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

        {userName ? (
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <Tag color="blue">Logged in: {userName}</Tag>
          </div>
        ) : null}

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
            <Button icon={<UploadOutlined />} style={{ marginTop: "15px" }}>
              Change Photo
            </Button>
          </Upload>
        </div>

        <Form
          form={form}
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
            label="Contact Number"
            name="phone"
            rules={[{ required: false }]} 
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

          <Form.Item label="Bio" name="bio" rules={[{ required: false }]}>
            <Input.TextArea rows={4} placeholder="Write something about you" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
             
            </Space>
          </Form.Item>

        
        </Form>
      </Card>
    </div>
  );
}

