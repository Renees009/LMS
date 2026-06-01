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

const API_BASE = "http://localhost:8000";

export default function SignUp() {
  const [accountType, setAccountType] = useState("student");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const {
      username,
      password,
      email,
      fullName,
      phone,
      tutorName,
      specialization,
      contactNumber,
    } = values;

    if (accountType === "student" && !fullName) {
      message.error("Full Name is required for students");
      return;
    }
    if (accountType === "tutor" && !tutorName) {
      message.error("Tutor Name is required for tutors");
      return;
    }

    setLoading(true);
    try {
      const requestBody = {
        username,
        password,
        email,
        role: accountType,
      };

      if (accountType === "student") {
        requestBody.fullName = fullName || "";
        requestBody.phone = phone || "";
      } else {
        requestBody.tutorName = tutorName || "";
        requestBody.specialization = specialization || "";
        requestBody.contactNumber = contactNumber || "";
      }

      console.log("Sending signup request:", requestBody);

      const res = await fetch(`${API_BASE}/api/auth/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", res.status);

      const data = await res.json().catch((err) => {
        console.error("Failed to parse JSON response:", err);
        return null;
      });

      console.log("Response data:", data);

      if (!res.ok) {
        console.error("Signup error:", data);
        
        let errorMsg = "Signup failed";
        
        if (data?.errors) {
       
          if (data.errors.username) {
            errorMsg = Array.isArray(data.errors.username) 
              ? data.errors.username[0] 
              : data.errors.username;
          } else if (data.errors.email) {
            errorMsg = Array.isArray(data.errors.email) 
              ? data.errors.email[0] 
              : data.errors.email;
          } else if (data.errors.password) {
            errorMsg = Array.isArray(data.errors.password) 
              ? data.errors.password[0] 
              : data.errors.password;
          } else {
           
            const firstKey = Object.keys(data.errors)[0];
            if (firstKey) {
              const firstError = data.errors[firstKey];
              errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
            }
          }
        } else if (data?.error) {
          errorMsg = data.error;
        } else if (data?.detail) {
          errorMsg = data.detail;
        }
        
        message.error(errorMsg);
        return;
      }

      if (!data || !data.access) {
        console.error("Invalid response format:", data);
        message.error("Server returned invalid response");
        return;
      }

      const access = data.access;
      const role = data.role || accountType;

      console.log("Signup successful:", { username, role, userId: data.id });
      setAuth({ token: access, role });
      message.success("Account created successfully");

     
      form.resetFields();

      setTimeout(() => {
        if (role === "student") {
          window.location.href = "/signin";
        } else {
          window.location.href = "/signin";
        }
      }, 500);
    } catch (error) {
      console.error("Signup request error:", error);
      message.error("Network error: " + error.message);
    } finally {
      setLoading(false);
    }
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
              {
                min: 6,
                message: "Password must be at least 6 characters",
              },
            ]}
          >
            <Input.Password placeholder="Enter password (min 6 characters)" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Enter email",
              },
              {
                type: "email",
                message: "Invalid email format",
              },
            ]}
          >
            <Input type="email" placeholder="Enter email" />
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
                label="Phone (Optional)"
                name="phone"
              >
                <Input placeholder="Enter phone number" />
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
                label="Specialization (Optional)"
                name="specialization"
              >
                <Input placeholder="e.g. Mathematics" />
              </Form.Item>

              <Form.Item
                label="Contact Number (Optional)"
                name="contactNumber"
              >
                <Input placeholder="Enter contact number" />
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