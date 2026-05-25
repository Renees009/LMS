import { Link, Outlet, useLocation } from "react-router-dom";
import {
  FaUserGraduate,
  FaBookOpen,
  FaClipboardList,
  FaCheckCircle,
  FaCog,
} from "react-icons/fa";

export default function StudentLayout() {
  const location = useLocation();

  const menu = [
    {
      name: "Student Profile",
      path: "/student/profile",
      icon: <FaUserGraduate />,
    },
    {
      name: "Explore Course",
      path: "/student/explore",
      icon: <FaBookOpen />,
    },
    {
      name: "Enrolled Course",
      path: "/student/enrolled",
      icon: <FaClipboardList />,
    },
    {
      name: "Completed Course",
      path: "/student/completed",
      icon: <FaCheckCircle />,
    },
    {
      name: "Settings",
      path: "/student/settings",
      icon: <FaCog />,
    },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          backgroundColor: "#1e293b",
          color: "white",
          padding: "20px",
          position: "fixed",
          height: "100%",
          left: 0,
          top: 0,
        }}
      >
        <h2>Flow Learn Hub</h2>

        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: "flex",
              gap: "10px",
              padding: "12px",
              marginTop: "10px",
              textDecoration: "none",
              color: "white",
              borderRadius: "8px",
              background:
                location.pathname === item.path
                  ? "#334155"
                  : "transparent",
            }}
          >
            {item.icon}
            {item.name}
          </Link>
          
        ))}
      </div>

      
      <div
        style={{
          marginLeft: "270px",
          padding: "20px",
          width: "100%",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}