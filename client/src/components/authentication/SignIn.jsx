import { useState } from "react";
import { setAuth } from "../../auth/auth";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
} from "antd";

const { Title, Text } = Typography;

const API_BASE = "http://localhost:8000";

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const { username, password } = values;

    setLoading(true);
    try {
      const requestBody = {
        username,
        password,
      };

      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("Login error:", data);
        const errorMsg =
          data?.error || data?.detail || "Invalid username or password";
        message.error(errorMsg);
        return;
      }

      const access = data?.access;
      const role = data?.role;

      if (!access || !role) {
        message.error("Server error: incomplete response");
        return;
      }
      setAuth({ token: access, role });
      message.success("Login successful");


      form.resetFields();

      setTimeout(() => {
        if (role === "student") {
          window.location.href = "/student/explore";
        } else if (role === "tutor") {
          window.location.href = "/tutor/courses";
        } else {
          console.warn("Unknown role:", role);
          window.location.href = "/student/explore";
        }
      }, 500);
    } catch (error) {
      console.error("Login request error:", error);
      message.error("Network error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Title
          level={2}
          style={{
            textAlign: "center",
            color: "#1e293b",
          }}
        >
          FLOW LEARN HUB
        </Title>

        <Title
          level={3}
          style={{
            textAlign: "center",
            color: "#334155",
            marginBottom: 30,
          }}
        >
          Sign In
        </Title>

        <Form
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: "Enter username",
              },
            ]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Enter password",
              },
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Text
          style={{
            display: "block",
            textAlign: "center",
          }}
        >
          Don&apos;t have an account?{" "}
          <a href="/signup">Sign Up</a>
        </Text>
      </Card>
    </div>
  );
}