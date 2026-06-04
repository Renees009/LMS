import { useState } from "react";
import { setAuth } from "../../auth/auth";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Radio,
  Select,
  message,
} from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE = "http://localhost:8000";

export default function SignUp() {
  const [accountType, setAccountType] = useState("student");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordValue, setPasswordValue] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const validatePassword = (password) => {
    const errors = [];
    
    if (!password) {
      return errors;
    }
    
    if (password.length < 8) {
      errors.push("at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("at least 1 uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("at least 1 lowercase letter");
    }
    if (!/\d/.test(password)) {
      errors.push("at least 1 digit");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push("at least 1 special character");
    }
    
    return errors;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setPasswordValue(password);
    const errors = validatePassword(password);
    setPasswordErrors(errors);
    form.setFieldsValue({ password });
  };

  const handlePasswordFocus = () => {
    setIsPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    setTimeout(() => {
      setIsPasswordFocused(false);
    }, 200);
  };

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
      preferredCategory,
    } = values;

    if (accountType === "student" && !fullName) {
      message.error("Full Name is required for students");
      return;
    }
    if (accountType === "tutor" && !tutorName) {
      message.error("Tutor Name is required for tutors");
      return;
    }

    if (passwordErrors.length > 0) {
      message.error("Please fix password requirements before submitting");
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
        requestBody.preferredCategory = preferredCategory || "";
      } else {
        requestBody.tutorName = tutorName || "";
        requestBody.specialization = specialization || "";
        requestBody.contactNumber = contactNumber || "";
      }

      const res = await fetch(`${API_BASE}/api/auth/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
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

      setAuth({ token: access, role });
      message.success("Account created successfully");

      form.resetFields();
      setPasswordErrors([]);
      setPasswordValue("");
      setIsPasswordFocused(false);

      setTimeout(() => {
        window.location.href = "/signin";
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
        padding: "20px",
        position: "relative",
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
              onChange={(e) => {
                setAccountType(e.target.value);
                setPasswordErrors([]);
                setPasswordValue("");
                setIsPasswordFocused(false);
              }}
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
            required
            validateStatus={passwordErrors.length > 0 && isPasswordFocused ? "error" : ""}
            help={null}
          >
            <Input.Password 
              placeholder="Enter password" 
              onChange={handlePasswordChange}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
            />
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
                label="Preferred Category"
                name="preferredCategory"
                rules={[
                  {
                    required: true,
                    message: "Please select a preferred category",
                  },
                ]}
              >
                <Select placeholder="Select your preferred learning category">
                  <Option value="programming">Programming</Option>
                  <Option value="designing">Designing</Option>
                  <Option value="ai">Artificial Intelligence</Option>
                  <Option value="cs">Computer Science</Option>
                  <Option value="other">Other</Option>
                </Select>
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

      {isPasswordFocused && passwordValue && passwordErrors.length > 0 && (
        <div style={{ 
          position: "fixed",
          right: "50px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "280px",
          padding: "16px",
          background: "#fff2f0",
          border: "1px solid #ffccc7",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 1000,
          animation: "fadeIn 0.3s ease-in-out",
        }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: "18px", marginRight: "8px" }}>⚠️</span>
            <Text strong style={{ color: "#ff4d4f", fontSize: "14px" }}>
              Password must include:
            </Text>
          </div>
          <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
            {passwordErrors.map((error, index) => (
              <li key={index} style={{ 
                color: "#ff4d4f", 
                fontSize: "13px",
                marginBottom: "8px",
                listStyleType: "circle"
              }}>
                {error}
              </li>
            ))}
          </ul>
          <div style={{ 
            marginTop: 12, 
            paddingTop: 8, 
            borderTop: "1px solid #ffccc7",
            fontSize: "12px",
            color: "#ff7a5c"
          }}>
            <Text type="secondary" style={{ fontSize: "11px" }}>
              * Please ensure your password meets all requirements
            </Text>
          </div>
        </div>
      )}

      {isPasswordFocused && !passwordValue && (
        <div style={{ 
          position: "fixed",
          right: "50px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "280px",
          padding: "16px",
          background: "#e6f7ff",
          border: "1px solid #91d5ff",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 1000,
          animation: "fadeIn 0.3s ease-in-out",
        }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: "18px", marginRight: "8px" }}>💡</span>
            <Text strong style={{ color: "#1890ff", fontSize: "14px" }}>
              Password Requirements
            </Text>
          </div>
          <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
            <li style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>At least 8 characters</li>
            <li style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>At least 1 uppercase letter</li>
            <li style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>At least 1 lowercase letter</li>
            <li style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>At least 1 digit</li>
            <li style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>At least 1 special character</li>
          </ul>
        </div>
      )}
    </div>
  );
}

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-50%) translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }
  }
`;
document.head.appendChild(style);