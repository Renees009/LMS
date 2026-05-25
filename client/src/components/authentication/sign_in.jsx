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

const ACCOUNTS_KEY = "lms_accounts_v1";

function loadAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function makeFakeToken() {
  return `ui_token_${Math.random().toString(16).slice(2)}`;
}

export default function SignIn() {
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    const { username, password } = values;

    if (username !== password) {
      message.error("Invalid username or password");
      return;
    }

    const accounts = loadAccounts();
    const account = accounts[username];

    if (!account || account.password !== password) {
      message.error("Invalid   or password");
      return;
    }

    setLoading(true);

    setAuth({
      token: makeFakeToken(),
      role: account.role,
    });

    message.success("Login successful");

    setTimeout(() => {
      if (account.role === "student") {
        window.location.href = "/student/explore";
      } else {
        window.location.href = "/tutor/courses";
      }
    }, 1000);
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