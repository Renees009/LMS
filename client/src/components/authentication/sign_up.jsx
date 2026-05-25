import { useState } from "react";
import { setAuth } from "../../auth/auth";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Radio,
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

function saveAccounts(next) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
}

function makeFakeToken() {
  return `ui_token_${Math.random().toString(16).slice(2)}`;
}

export default function SignUp() {
  const [accountType, setAccountType] = useState("student");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = (values) => {
    const {
      username,
      password,
      fullName,
      studentId,
      tutorName,
      specialization,
    } = values;

    if (username !== password) {
      message.error("Username must be same as password");
      return;
    }

    const accounts = loadAccounts();

    if (accounts[username]) {
      message.error("Account already exists");
      return;
    }

    accounts[username] = {
      username,
      password,
      role: accountType,
      fullName,
      studentId,
      tutorName,
      specialization,
      createdAt: Date.now(),
    };

    setLoading(true);
    saveAccounts(accounts);
    setAuth({
      token: makeFakeToken(),
      role: accountType,
    });

    message.success("Account created successfully");

    setTimeout(() => {
      if (accountType === "student") {
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
        background: "#f8fafc",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        style={{
          width: 500,
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
          Sign Up
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item label="Account Type">
            <Radio.Group
              value={accountType}
              onChange={(e) =>
                setAccountType(e.target.value)
              }
            >
              <Radio value="student">Student</Radio>
              <Radio value="tutor">Tutor</Radio>
            </Radio.Group>
          </Form.Item>

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

          {accountType === "student" ? (
            <>
              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[
                  {
                    required: true,
                    message: "Enter full name",
                  },
                ]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>

              <Form.Item
                label="Student ID"
                name="studentId"
              >
                <Input placeholder="Optional" />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                label="Tutor Name"
                name="tutorName"
                rules={[
                  {
                    required: true,
                    message: "Enter tutor name",
                  },
                ]}
              >
                <Input placeholder="Enter tutor name" />
              </Form.Item>

              <Form.Item
                label="Specialization"
                name="specialization"
              >
                <Input placeholder="Optional" />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <Text
          style={{
            display: "block",
            textAlign: "center",
          }}
        >
          Already have an account?{" "}
          <a href="/signin">Sign In</a>
        </Text>
      </Card>
    </div>
  );
}