import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Typography, Button, Tooltip } from "antd";
import {
  UserOutlined,
  BookOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

const { Sider, Content } = Layout;
const { Title } = Typography;

export default function TutorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

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
      <Sider
        width={250}
        collapsed={collapsed}
        collapsible
        trigger={null}
        style={{
          background: "#1e293b",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo Section with Collapse Button Next to Title */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          {!collapsed ? (
            <>
              <Title
                level={4}
                style={{
                  color: "white",
                  margin: 0,
                  flex: 1,
                  fontSize: "18px",
                }}
              >
                Flow Tutor Hub
              </Title>
              <Tooltip title="Collapse" placement="right">
                <Button
                  type="text"
                  icon={<MenuFoldOutlined />}
                  onClick={() => setCollapsed(true)}
                  style={{
                    color: "white",
                    fontSize: "16px",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              </Tooltip>
            </>
          ) : (
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Tooltip title="Expand" placement="right">
                <Button
                  type="text"
                  icon={<MenuUnfoldOutlined />}
                  onClick={() => setCollapsed(false)}
                  style={{
                    color: "white",
                    fontSize: "16px",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              </Tooltip>
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
        />
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 250,
          transition: "margin-left 0.2s ease",
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