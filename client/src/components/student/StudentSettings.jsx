import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Switch,
  Typography,
  Card,
  message,
} from "antd";

const { Title, Text } = Typography;

export default function StudentSettings() {
  const [darkTheme, setDarkTheme] = useState(localStorage.getItem("theme") === "dark");
  const [form] = Form.useForm();
  const API_BASE = "http://localhost:8000";

  const handleThemeChange = (checked) => {
    setDarkTheme(checked);
    const themeValue = checked ? "dark" : "light";
    localStorage.setItem("theme", themeValue);
    // Notify other components/layouts in the same window
    window.dispatchEvent(new Event("storage"));
  };

  const onFinish = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Password mismatch!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/tutor/me/password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("lms_token")}`,
        },
        body: JSON.stringify({
          old_password: values.oldPassword,
          new_password: values.newPassword,
          confirm_password: values.confirmPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        message.error(data?.error || "Failed to change password");
        return;
      }

      message.success(data?.message || "Password changed successfully!");
      form.resetFields(["oldPassword", "newPassword", "confirmPassword"]);
    } catch (e) {
      console.error(e);
      message.error("Failed to change password");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        backgroundColor: darkTheme ? "#0f172a" : "#f8fafc",
        transition: "0.3s",
      }}
    >
      <Card
        style={{
          maxWidth: 700,
          margin: "auto",
          borderRadius: 12,
        }}
      >
        <Title
          level={2}
          style={{
            textAlign: "center",
            color: darkTheme ? "#f8fafc" : "#1e293b",
          }}
        >
          Student Settings
        </Title>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Old Password"
            name="oldPassword"
            rules={[{ required: true, message: "Please enter old password" }]}
          >
            <Input placeholder="Enter old password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              {
                required: true,
                message: "Please enter new password",
              },
            ]}
          >
            <Input placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            rules={[
              {
                required: true,
                message: "Please confirm password",
              },
            ]}
          >
            <Input.Password placeholder="Confirm password" />
          </Form.Item>

          <Form.Item style={{ textAlign: "center" }}>
            <Button type="primary" htmlType="submit" size="large">
              Change Password
            </Button>
          </Form.Item>

          <Form.Item>
            <Text strong>Theme</Text>
            <div style={{ marginTop: 10 }}>
              <Switch checked={darkTheme} onChange={handleThemeChange} />{" "}
              <span style={{ marginLeft: 10 }}>
                {darkTheme ? "Dark Theme" : "Light Theme"}
              </span>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
