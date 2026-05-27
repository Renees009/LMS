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
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function TutorProfile() {
  const [profileImage, setProfileImage] = useState(null);
  const selectedFileRef = useRef(null);
  const API_BASE = "http://localhost:8000";
  const [userName, setUserName] = useState("");

  const [form] = Form.useForm();

  const handleUpload = (info) => {
    const file = info.file.originFileObj;
    if (file) {
      selectedFileRef.current = file;
      setProfileImage(URL.createObjectURL(file));
      message.success("Profile image updated");
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tutor/me/profile/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('lms_token')}`,
        },
      });
      if (!res.ok) return;
      const data = await res.json();

      form.setFieldsValue({
        name: data.tutor_name || "",
        specialization: data.specialization || "",
        phone: data.contact_number || "",
        email: data.email || "",
      });

   
      setUserName(data.username || "");

      if (data.profile_image) {
        setProfileImage(data.profile_image);
      } else {
        setProfileImage(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProfile();
   
  }, []);

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append("tutor_name", values.name);
      formData.append("specialization", values.specialization || "");
      formData.append("contact_number", values.phone || "");
      formData.append("email", values.email || "");

      if (selectedFileRef.current) {
        formData.append("profile_image", selectedFileRef.current);
      }

      const res = await fetch(`${API_BASE}/api/tutor/me/profile/`, {
        method: "PUT",
        body: formData,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('lms_token')}`,
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
          Tutor Profile
        </Title>
        {userName ? (
          <div style={{ textAlign: "center", marginBottom: 16, color: "#334155" }}>
            Logged in: {userName}
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
            label="Tutor Name"
            name="name"
            rules={[{ required: true, message: "Enter tutor name" }]}
          >
            <Input placeholder="Enter tutor name" />
          </Form.Item>

          <Form.Item
            label="Specialization"
            name="specialization"
            rules={[{ required: true, message: "Enter specialization" }]}
          >
            <Input placeholder="Enter specialization" />
          </Form.Item>

          <Form.Item
            label="Contact Number"
            name="phone"
            rules={[{ required: true, message: "Enter contact number" }]}
          >
            <Input placeholder="Enter contact number" />
          </Form.Item>

          <Form.Item
            label="Gmail"
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
              <Button onClick={fetchProfile}>Update</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

