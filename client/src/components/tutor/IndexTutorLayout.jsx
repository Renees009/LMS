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

  const handleLogout = () => {
   
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
        theme="dark"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ padding: "20px" }}>
          <Title
            level={3}
            style={{
              color: "white",
              textAlign: "center",
              margin: 0,
            }}
          >
            Flow Tutor Hub
          </Title>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ fontSize: "16px" }}
        />
      </Sider>

      <Layout style={{ marginLeft: 250 }}>
        <Content
          style={{
            backgroundColor: "white",
            minHeight: "100vh",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}