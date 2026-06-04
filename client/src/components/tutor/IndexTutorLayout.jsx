import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Typography } from "antd";
import {
  UserOutlined,
  BookOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Sider, Content } = Layout;
const { Title } = Typography;

export default function TutorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("lms_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const menuItems = [
    {
      key: "/tutor/profile",
      icon: <UserOutlined />,
      label: "Tutor Profile",
    },
    {
      key: "/tutor/courses",
      icon: <BookOutlined />,
      label: "My Courses",
    },
    {
      key: "/tutor/add-course",
      icon: <PlusCircleOutlined />,
      label: "Add Course",
    },
    {
      key: "/tutor/settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      handleLogout();
    } else {
      navigate(key);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          width: isHovered ? 250 : 80,
          transition: "width 0.3s ease",
          background: "#1e293b",
          boxShadow: isHovered ? "2px 0 8px rgba(0,0,0,0.15)" : "none",
        }}
      >
        <Sider
          width={250}
          collapsed={!isHovered}
          collapsedWidth={80}
          trigger={null}
          style={{
            background: "#1e293b",
            height: "100%",
          }}
        >
          <div
            style={{
              padding: "20px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {isHovered ? (
              <Title
                level={4}
                style={{
                  color: "white",
                  margin: 0,
                  textAlign: "center",
                  fontSize: "18px",
                }}
              >
                Flow Tutor Hub
              </Title>
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                T
              </div>
            )}
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              background: "#1e293b",
              fontSize: "14px",
              borderRight: "none",
              marginTop: 8,
            }}
            inlineCollapsed={!isHovered}
          />
        </Sider>
      </div>

      <Layout
        style={{
          marginLeft: isHovered ? 250 : 80,
          transition: "margin-left 0.3s ease",
          background: "#f8fafc",
        }}
      >
        <Content
          style={{
            background: "#f8fafc",
            minHeight: "100vh",
            padding: "24px",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}