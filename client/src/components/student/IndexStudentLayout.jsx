import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Typography } from "antd";
import {
  UserOutlined,
  BookOutlined,
  ProfileOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Sider, Content } = Layout;
const { Title } = Typography;

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
 
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/signin");
  };

  const menuItems = [
    {
      key: "/student/profile",
      icon: <UserOutlined />,
      label: "Student Profile",
    },
    {
      key: "/student/explore",
      icon: <BookOutlined />,
      label: "Explore Course",
    },
    {
      key: "/student/enrolled",
      icon: <ProfileOutlined />,
      label: "Enrolled Course",
    },
    {
      key: "/student/completed",
      icon: <CheckCircleOutlined />,
      label: "Completed Course",
    },
    {
      key: "/student/settings",
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
        style={{
          background: "#1e293b",
        }}
      >
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Title level={3} style={{ color: "white", margin: 0 }}>
            Flow Student Hub
          </Title>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: "#1e293b",
            fontSize: "16px",
          }}
        />
      </Sider>

      <Layout>
        <Content
          style={{
            background: "#f8fafc",
            minHeight: "100vh",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}