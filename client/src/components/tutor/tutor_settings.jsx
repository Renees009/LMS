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

export default function TutorSettings() {
  const [darkTheme, setDarkTheme] = useState(false);
  const [form] = Form.useForm();

  const onFinish = (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Password mismatch!");
      return;
    }

    message.success("Password changed successfully!");
    form.resetFields(["newPassword", "confirmPassword"]);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        backgroundColor: darkTheme ? "#1e293b" : "#f8fafc",
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
            color: darkTheme ? "#1e293b" : "#1e293b",
          }}
        >
          Tutor Settings
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item label="Old Password">
            <Input.Password
              value="********"
              readOnly
            />
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
            <Button
              type="primary"
              htmlType="submit"
              size="large"
            >
              Change Password
            </Button>
          </Form.Item>

          <Form.Item>
            <Text strong>Theme</Text>
            <div style={{ marginTop: 10 }}>
              <Switch
                checked={darkTheme}
                onChange={setDarkTheme}
              />{" "}
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